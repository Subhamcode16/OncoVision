# 🧬 OncoVision AI

### "Bridges the Gap Between AI Diagnostic Power and Clinical Understanding."

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Precision: 99%](https://img.shields.io/badge/Accuracy-97.6%25-green.svg)](#)

---

## 📌 The Problem
Breast cancer is the most common cancer among women worldwide. However, medical diagnostics often face two critical hurdles:
1.  **The Jargon Barrier:** Patients and non-medical users find clinical reports (e.g., "Mean Concavity") intimidating and unreadable.
2.  **The Black Box:** Doctors are often hesitant to trust AI models that can't explain *why* a certain diagnosis was reached.
3.  **The Sensitivity Gap:** Standard ML models often prioritize overall accuracy, sometimes missing malignant cases (False Negatives) which can be life-threatening.

## 🚀 The Solution
**OncoVision AI** is a professional-grade diagnostic bridge that combines high-precision machine learning with radical transparency.

*   **97.6% Recall Focus:** Our core SVM engine is tuned specifically to minimize False Negatives, ensuring that early-stage malignant cells are flagged with maximum sensitivity.
*   **Explainable AI (SHAP):** Every diagnosis is accompanied by a SHAP (SHapley Additive exPlanations) chart, revealing exactly which physical characteristics led the AI to its conclusion.
*   **Intelligent Report Gateway:** Powered by **Gemini 2.5 Flash**, users can upload their pathology reports directly. The AI scans the clinical text, extracts cytological metrics, and auto-populates the diagnostic model, removing the technical barrier for laypeople.
*   **Patient-Friendly Interface:** We translate complex clinical metrics into plain English, providing clear action steps and helpful tooltips for non-medical users.

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Google Colab] -- "Trained Model (SVM)" --> B[Local Models Folder]
    B -- "Load artifacts" --> C[FastAPI Backend]
    D[Next.js Dashboard] -- "POST /predict" --> C
    C -- "Diagnosis + Confidence + SHAP" --> D
    D -- "Patient-Friendly View" --> E[End User]
```

---

## 🛠️ Tech Stack
| Category | Technology |
| :--- | :--- |
| **Machine Learning** | Scikit-Learn, SVM, XGBoost, SHAP |
| **Generative AI** | Google Gemini 2.5 Flash (via google-genai SDK) |
| **Backend** | FastAPI, Python 3.12, Joblib |
| **Frontend** | Next.js 15 (App Router), TypeScript, Vanilla CSS, GSAP |
| **Connectivity** | Cloudflare Tunnel (Remote-to-Local Bridge) |

---

## 📋 Component Roster
| Name | Role | Location | Description |
| :--- | :--- | :--- | :--- |
| **SVM Engine** | Core Model | `models/svm_tuned.pkl` | Optimized support vector machine with 97.6% recall. |
| **Prediction API** | Backend | `src/server.py` | FastAPI server that scales inputs and performs inference. |
| **Diagnostic UI** | Frontend | `frontend/src/app/page.tsx` | High-fidelity medical dashboard with patient-friendly mode. |
| **Report Scanner** | AI Agent | `src/server.py` | Gemini-powered report analysis and feature extraction. |
| **Live Logger** | Tooling | `live_logger.py` | Real-time bridge for streaming Colab logs to local dev. |

---

## ⚡ Quick Start

### 1. Prerequisites
| Software | Version | Purpose |
| :--- | :--- | :--- |
| Python | 3.12+ | Backend & ML Processing |
| Node.js | 18+ | Frontend Dashboard |
| Pip | Latest | Package Management |

### 2. Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/oncovision-ai.git
cd oncovision-ai

# 2. Install dependencies
pip install fastapi uvicorn joblib scikit-learn numpy
cd frontend && npm install && cd ..

# 3. Start the Backend (Port 8000)
python src/server.py

# 4. Start the Frontend (Port 3000)
cd frontend && npm run dev
```

> [!NOTE]
> The dashboard will be available at `http://localhost:3000`. Ensure the backend is running on `http://localhost:8000` for live predictions.

---

## 📈 Future Roadmap
- [ ] **CSV Batch Import:** Allow doctors to upload bulk patient data for population screening.
- [ ] **DICOM Support:** Integration for direct mammography image analysis.
- [ ] **Mobile App:** React Native bridge for remote patient monitoring.

---

## ⚠️ Disclaimer
> [!CAUTION]
> This software is intended for research and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

---
**OncoVision AI** — *Empowering Health through Precision Intelligence.*
