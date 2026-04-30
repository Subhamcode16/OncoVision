from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi import File, UploadFile
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from google import genai
import json
from dotenv import load_dotenv

load_dotenv()

# Rate Limiter setup
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="OncoVision AI Backend")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths
SCALER_PATH = "models/scaler.pkl"
MODEL_PATH = "models/svm_tuned.pkl"

# Global variables for model and scaler
model = None
scaler = None

def load_artifacts():
    global model, scaler
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"Scaler not found at {SCALER_PATH}")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    
    scaler = joblib.load(SCALER_PATH)
    model = joblib.load(MODEL_PATH)
    print("SUCCESS: Model and Scaler loaded successfully.")

# Load on startup
try:
    load_artifacts()
except Exception as e:
    print(f"WARNING: Could not load models on startup: {e}")

class PatientData(BaseModel):
    radius_mean: float
    texture_mean: float
    perimeter_mean: float
    area_mean: float
    smoothness_mean: float
    compactness_mean: float
    concavity_mean: float
    concave_points_mean: float

@app.post("/predict")
async def predict(data: PatientData):
    if model is None or scaler is None:
        try:
            load_artifacts()
        except:
            raise HTTPException(status_code=500, detail="Models not loaded on server.")

    try:
        # 1. Start with the dataset means (neutral values)
        features = np.array([
            14.06, 19.24, 91.55, 648.54, 0.096, 0.103, 0.089, 0.048, 0.180, 0.062,
            0.398, 1.218, 2.822, 39.24, 0.007, 0.025, 0.032, 0.011, 0.020, 0.003,
            16.17, 25.64, 106.62, 869.02, 0.132, 0.254, 0.276, 0.113, 0.290, 0.083
        ])
        
        # 2. Inject the 8 real values from the user
        features[0] = data.radius_mean
        features[1] = data.texture_mean
        features[2] = data.perimeter_mean
        features[3] = data.area_mean
        features[4] = data.smoothness_mean
        features[5] = data.compactness_mean
        features[6] = data.concavity_mean
        features[7] = data.concave_points_mean
        
        # 3. Reshape for scaling
        features_arr = features.reshape(1, -1)
        
        # 4. Scale features
        features_scaled = scaler.transform(features_arr)
        
        # 5. Predict
        prediction = int(model.predict(features_scaled)[0])
        probabilities = model.predict_proba(features_scaled)[0]
        
        # 0 = Malignant, 1 = Benign
        diagnosis = "Malignant" if prediction == 0 else "Benign"
        confidence = float(np.max(probabilities) * 100)
        
        return {
            "diagnosis": diagnosis,
            "confidence": round(confidence, 2),
            "prediction_code": prediction,
            "probabilities": {
                "malignant": round(float(probabilities[0] * 100), 2),
                "benign": round(float(probabilities[1] * 100), 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.post("/api/scan-report")
@limiter.limit("5/minute")
async def scan_report(file: UploadFile = File(...)):
    """
    Scans a medical report using Gemini 1.5 Flash and extracts SVM features.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured on server.")

    try:
        # Read file content
        contents = await file.read()
        
        # Initialize the new Unified Gemini Client
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        prompt = """
        You are a clinical oncology data extractor. Analyze the attached medical report.
        
        TASK:
        1. Determine if this is a breast pathology, FNA, or biopsy report.
        2. If it is NOT a breast cancer related report (e.g., blood test, vitamin test), return: {"error": "not_oncology_report"}
        3. If it IS a breast cancer report, extract or estimate the following 8 features based on the descriptive text.
           Map the textual descriptions (e.g., 'small nuclei' vs 'large pleomorphic nuclei') to the typical ranges for the Wisconsin Breast Cancer Dataset.
        
        FIELDS TO EXTRACT:
        - radius_mean (Typical range: 6.0 to 28.0)
        - texture_mean (Typical range: 9.0 to 39.0)
        - perimeter_mean (Typical range: 43.0 to 188.0)
        - area_mean (Typical range: 143.0 to 2501.0)
        - smoothness_mean (Typical range: 0.05 to 0.16)
        - compactness_mean (Typical range: 0.01 to 0.34)
        - concavity_mean (Typical range: 0.0 to 0.42)
        - concave_points_mean (Typical range: 0.0 to 0.20)
        
        Return ONLY a JSON object.
        Example: {"radius_mean": 14.5, "texture_mean": 20.1, ...}
        """

        # Generate content using the new SDK pattern
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                prompt,
                {"mime_type": file.content_type, "data": contents}
            ]
        )
        
        try:
            # Extract JSON from response text (handle markdown code blocks if any)
            text_response = response.text
            if "```json" in text_response:
                text_response = text_response.split("```json")[1].split("```")[0]
            elif "```" in text_response:
                text_response = text_response.split("```")[1].split("```")[0]
            
            extracted_data = json.loads(text_response.strip())
            
            if "error" in extracted_data:
                return {"success": False, "error": extracted_data["error"]}
                
            return {"success": True, "data": extracted_data}
            
        except Exception as json_err:
            print(f"AI Response parsing error: {json_err} | Raw: {response.text}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scanning error: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
