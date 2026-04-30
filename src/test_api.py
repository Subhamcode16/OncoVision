import requests
import os
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("Checking backend health...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health: {response.json()}")
    except Exception as e:
        print(f"FAILED: Backend not reachable: {e}")

def test_prediction_edge_cases():
    print("\nTesting prediction edge cases...")
    # Missing fields or 0 values
    data = {
        "radius_mean": 0,
        "texture_mean": 10.0,
        "perimeter_mean": 120.0,
        "area_mean": 1000.0,
        "smoothness_mean": 0.1,
        "compactness_mean": 0.1,
        "concavity_mean": 0.1,
        "concave_points_mean": 0.1
    }
    response = requests.post(f"{BASE_URL}/predict", json=data)
    print(f"Prediction with 0-value: {response.status_code} | {response.json()}")

def test_scan_report_no_key():
    print("\nTesting scanner without key...")
    # This would require temporarily renaming .env or similar
    pass

if __name__ == "__main__":
    test_health()
    test_prediction_edge_cases()
