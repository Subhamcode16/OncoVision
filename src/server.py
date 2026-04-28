from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="OncoVision AI Backend")

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
    # Mapping of our 4 UI features to their 0-indexed positions in the 30-feature vector
    radius_mean: float
    texture_mean: float
    perimeter_mean: float
    area_mean: float

@app.post("/predict")
async def predict(data: PatientData):
    if model is None or scaler is None:
        try:
            load_artifacts()
        except:
            raise HTTPException(status_code=500, detail="Models not loaded on server.")

    try:
        # 1. Start with the dataset means (neutral values)
        # These are the means from our StandardScaler check
        features = np.array([
            14.06, 19.24, 91.55, 648.54, 0.096, 0.103, 0.089, 0.048, 0.180, 0.062,
            0.398, 1.218, 2.822, 39.24, 0.007, 0.025, 0.032, 0.011, 0.020, 0.003,
            16.17, 25.64, 106.62, 869.02, 0.132, 0.254, 0.276, 0.113, 0.290, 0.083
        ])
        
        # 2. Inject the 4 real values from the user
        features[0] = data.radius_mean
        features[1] = data.texture_mean
        features[2] = data.perimeter_mean
        features[3] = data.area_mean
        
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

@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
