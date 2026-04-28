# Project Journal: OncoVision AI Implementation

## Date: April 29, 2026

### 🚀 Key Accomplishments
1.  **Real-Time Colab Bridge:** Established a FastAPI `live_logger.py` and Cloudflare tunnel to stream training logs from Google Colab to the local terminal. This bypassed the "blind" coding issue and allowed real-time pipeline monitoring.
2.  **High-Precision Training:** Executed a full ML pipeline comparing SVM, Random Forest, XGBoost, and ANN. 
3.  **Model Optimization:** Tuned hyperparameters with a focus on **Recall (Malignant)**. Achieved ~97.6% recall with a Tuned SVM (C=1, gamma=0.01, kernel='rbf').
4.  **SHAP Integration:** Successfully generated SHAP KernelExplainability reports. Overcame `AssertionError` in Colab by correctly slicing the 3D SHAP matrix `[:, :, 0]` for binary classification.
5.  **Full-Stack Diagnostic Dashboard:** Built a Next.js (Light Mode) dashboard and a FastAPI backend.
6.  **Patient-Centric UI/UX:** Pivoted the UI from technical jargon (e.g., "Mean Perimeter") to patient-friendly language (e.g., "Boundary Length") with helpful tooltips and risk assessment summaries.
7.  **Partial Input Logic:** Solved a critical "bias" bug where padding missing features with `0` caused every prediction to be Benign. Implemented "Mean Padding" logic in the backend using dataset averages to maintain neutral weight for missing data.

### 🧠 Lessons Learned
- **Emoji Encoding:** Standard Windows terminals still struggle with Unicode emojis in Python prints. Avoid emojis in `live_logger.py` to prevent `UnicodeEncodeError`.
- **SHAP Versions:** SHAP's output format (list vs array) varies significantly between versions. Always use explicit shape checks (`len(shap_values.shape)`) to ensure robustness.
- **StandardScaler Sensitivity:** When testing a model with partial features, never pad with `0` unless the mean is `0`. Use the actual dataset means to keep the model balanced.

### 📂 File Structure
- `models/svm_tuned.pkl`: The champion model.
- `models/scaler.pkl`: The preprocessing unit.
- `src/server.py`: The live prediction API.
- `frontend/src/app/page.tsx`: The user interface.
