import uvicorn
from fastapi import FastAPI, Request
import datetime

app = FastAPI()

@app.post("/log")
async def log_message(request: Request):
    data = await request.json()
    time = data.get("time", datetime.datetime.now().strftime("%H:%M:%S"))
    msg = data.get("msg", "")
    
    # Cancer-ML-Bridge Style Logging
    print(f"\033[94m[{time}]\033[0m \033[95m[CANCER-ML]\033[0m {msg}")
    return {"status": "ok"}

if __name__ == "__main__":
    print("\033[92m[START]\033[0m Cancer-ML-Bridge Receiver starting on port 9078...")
    print("\033[93m[INFO]\033[0m Point your Colab code to your public tunnel URL.")
    uvicorn.run(app, host="0.0.0.0", port=9078, log_level="warning")
