# OncoVision Technical Report (V1.0)
**Date**: 2026-05-11
**Status**: Production Ready

## 1. Executive Summary
The OncoVision pipeline has been finalized with a Calibrated Support Vector Machine (SVM) achieving 97.6% recall and 95.3% precision. This satisfies the high-sensitivity requirements for clinical cancer diagnostics while minimizing over-diagnosis.

## 2. Model Performance
| Metric | Value |
| :--- | :--- |
| **Model Type** | Calibrated SVC (Platt Scaling) |
| **Optimized Threshold** | 0.43 |
| **Recall (Malignant)** | 97.62% |
| **Precision (Malignant)** | 95.35% |
| **Accuracy** | 97.37% |
| **AUC-ROC** | 0.9950 |

## 3. Confusion Matrix Breakdown
- **True Positives**: 41 (Malignant correctly identified)
- **True Negatives**: 70 (Benign correctly identified)
- **False Positives**: 2 (Healthy patients flagged)
- **False Negatives**: 1 (Malignant cases missed)

## 4. Deployment Artifacts
- `models/oncovision_svm.joblib`: Main classifier.
- `models/scaler.joblib`: Preprocessing scaler.
- `models/cm_svm_calibrated_optimized.png`: Performance visualization.
