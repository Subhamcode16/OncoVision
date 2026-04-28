import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

def preprocess_data():
    print("--- Starting Phase 3: Preprocessing ---")
    
    # Load raw data
    raw_path = 'data/raw/breast_cancer.csv'
    if not os.path.exists(raw_path):
        print("Error: Raw data not found. Run initial_eda.py first.")
        return

    df = pd.read_csv(raw_path)
    X = df.drop('target', axis=1)
    y = df['target']

    # 1. Stratified Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Data split: Train={len(X_train)}, Test={len(X_test)}")

    # 2. Scaling (Fit on Train only, transform both)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save Scaler
    scaler_path = 'models/scaler.pkl'
    joblib.dump(scaler, scaler_path)
    print(f"Scaler saved to {scaler_path}")

    # 3. Save Processed Arrays
    processed_dir = 'data/processed'
    os.makedirs(processed_dir, exist_ok=True)
    
    np.save(f'{processed_dir}/X_train.npy', X_train_scaled)
    np.save(f'{processed_dir}/X_test.npy', X_test_scaled)
    np.save(f'{processed_dir}/y_train.npy', y_train)
    np.save(f'{processed_dir}/y_test.npy', y_test)
    
    print(f"Processed data arrays saved to {processed_dir}/")
    print("✅ Preprocessing complete.")

if __name__ == "__main__":
    os.makedirs('models', exist_ok=True)
    preprocess_data()
