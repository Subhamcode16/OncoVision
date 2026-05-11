from fastapi import FastAPI, HTTPException, Request
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
import re
import logging
import base64
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from dotenv import load_dotenv
from pydantic import Field

load_dotenv()

# Rate Limiter setup
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="OncoVision AI Backend")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup Audit Logger
logging.basicConfig(
    filename="scanner_audit.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("oncovision")

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Enable CORS for Production and Localhost
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
# On Render, we usually allow all subdomains of onrender.com
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*.onrender.com,localhost,127.0.0.1").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Middleware (Enable Trusted Hosts)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=ALLOWED_HOSTS)

# Enforce HTTPS in production
if os.getenv("ENV") == "production":
    app.add_middleware(HTTPSRedirectMiddleware)

@app.get("/health")
async def health_check():
    """Endpoint for Render to verify service health."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "threshold": metadata.get("threshold", 0.5)
    }

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Model paths
SCALER_PATH = "models/scaler.joblib"
MODEL_PATH = "models/oncovision_svm.joblib"
METADATA_PATH = "models/model_metadata.json"

# Global variables
model = None
scaler = None
metadata = {}

def load_artifacts():
    global model, scaler, metadata
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"Scaler not found at {SCALER_PATH}")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    
    scaler = joblib.load(SCALER_PATH)
    model = joblib.load(MODEL_PATH)
    
    # Load metadata for thresholding
    if os.path.exists(METADATA_PATH):
        with open(METADATA_PATH, 'r') as f:
            metadata = json.load(f)
    else:
        metadata = {"threshold": 0.5} # Fallback
        
    print(f"SUCCESS: Model and Scaler loaded. Active Threshold: {metadata.get('threshold')}")

# Load on startup
try:
    load_artifacts()
except Exception as e:
    print(f"WARNING: Could not load models on startup: {e}")

class PatientData(BaseModel):
    radius_mean: float = Field(..., gt=0, description="Mean of distances from center to points on the perimeter")
    texture_mean: float = Field(..., gt=0, description="Standard deviation of gray-scale values")
    perimeter_mean: float = Field(..., gt=0)
    area_mean: float = Field(..., gt=0)
    smoothness_mean: float = Field(..., gt=0)
    compactness_mean: float = Field(..., gt=0)
    concavity_mean: float = Field(..., ge=0)
    concave_points_mean: float = Field(..., ge=0)

def resilient_json_parse(text: str):
    """Recovers JSON from AI text even if surrounded by conversational filler."""
    try:
        # 1. Try direct parse
        return json.loads(text.strip())
    except json.JSONDecodeError:
        # 2. Try to find JSON block via regex
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    raise ValueError("No valid JSON found in AI response")

@app.post("/predict")
async def predict(data: PatientData):
    if model is None or scaler is None:
        try:
            load_artifacts()
        except:
            raise HTTPException(status_code=500, detail="Models not loaded on server.")

    try:
        # 1. Start with the dataset means (neutral values)
        # Breast Cancer Wisconsin (Diagnostic) has 30 features
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
        
        # 3. Reshape and Scale
        features_scaled = scaler.transform(features.reshape(1, -1))
        
        # 4. Probabilistic Prediction with Optimized Threshold
        probabilities = model.predict_proba(features_scaled)[0]
        
        # In this dataset: Class 0 = Malignant, Class 1 = Benign
        # metadata['threshold'] is the min prob of Malignant (0) to trigger a positive diagnosis
        threshold = metadata.get("threshold", 0.5)
        
        # If Prob(Malignant) >= threshold, classify as Malignant (0)
        prediction_code = 0 if probabilities[0] >= threshold else 1
        diagnosis = "Malignant" if prediction_code == 0 else "Benign"
        
        # Confidence is the probability of the predicted class
        confidence = probabilities[prediction_code] * 100
        
        return {
            "diagnosis": diagnosis,
            "confidence": round(float(confidence), 2),
            "prediction_code": int(prediction_code),
            "threshold_used": threshold,
            "probabilities": {
                "malignant": round(float(probabilities[0] * 100), 2),
                "benign": round(float(probabilities[1] * 100), 2)
            }
        }
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.post("/api/scan-report")
@limiter.limit("5/minute")
async def scan_report(request: Request, file: UploadFile = File(...)):
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
        ACT AS: A Senior Medical Pathologist and Expert Vision OCR Engine.
        
        INPUT: A medical report (possibly a camera photo with shadows, skew, or noise).
        
        VISION INSTRUCTIONS:
        1. Ignore shadows, background hands/desks, and skewed perspectives.
        2. Perform deep OCR on all visible clinical text, focusing on 'Microscopic Description' and 'Impression'.
        3. If the image is unreadable (too blurry/dark), return: {"error": "low_resolution"}
        
        CLINICAL VALIDATION:
        1. Verify if this is a breast-related pathology/FNA/Biopsy report.
        2. If NOT breast cancer related, return: {"error": "not_oncology_report"}
        
        FEATURE EXTRACTION:
        Extract or intelligently estimate the following 8 features based on the cytological descriptions:
        - radius_mean (6.0 to 28.0)
        - texture_mean (9.0 to 39.0)
        - perimeter_mean (43.0 to 188.0)
        - area_mean (143.0 to 2501.0)
        - smoothness_mean (0.05 to 0.16)
        - compactness_mean (0.01 to 0.34)
        - concavity_mean (0.0 to 0.42)
        - concave_points_mean (0.0 to 0.20)
        
        MAPPING LOGIC: 
        - 'Mild pleomorphism' -> Low-Mid range.
        - 'Marked atypia/Irregular chromatin' -> High range.
        - 'Smooth borders' -> Low range.
        
        Return ONLY a JSON object.
        """

        # In the modern Unified SDK, inline data must be base64 encoded
        encoded_content = base64.b64encode(contents).decode("utf-8")

        # Model Waterfall Strategy (Resilience against 429/404 errors)
        models_to_try = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
        response = None
        last_error = ""

        for model_name in models_to_try:
            try:
                logger.info(f"Attempting scan with {model_name}...")
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        prompt,
                        {
                            "inline_data": {
                                "mime_type": file.content_type,
                                "data": encoded_content
                            }
                        }
                    ]
                )
                if response:
                    logger.info(f"Successfully used {model_name}")
                    break
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Model {model_name} failed: {last_error}")
                continue
        
        if not response:
            return {"success": False, "error_type": f"Quota Exhausted: All models are currently unavailable. Last Error: {last_error}"}

        # Modern Response Handling (handling safety blocks or empty candidates)
        if not response.candidates or not response.candidates[0].content.parts:
            logger.warning(f"AI Blocked/Empty Response | File: {file.filename}")
            return {"success": False, "error_type": "The AI safety filter blocked this report. Please ensure it is a valid medical document."}
        
        try:
            ai_text = response.text
            extracted_data = resilient_json_parse(ai_text)
            
            if "error" in extracted_data:
                logger.warning(f"Scan Rejected: {extracted_data['error']} | File: {file.filename}")
                return {"success": False, "error_type": extracted_data["error"]}
                
            logger.info(f"Scan Successful: {file.filename}")
            return {"success": True, "data": extracted_data}
            
        except Exception as parse_err:
            logger.error(f"AI Parse Error: {parse_err} | Raw: {response.text}")
            return {"success": False, "error_type": "The AI response was malformed. Please try again with a clearer image."}

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Scanner System Error: {error_msg}")
        return {"success": False, "error_type": f"System Alert: {error_msg}"}

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
