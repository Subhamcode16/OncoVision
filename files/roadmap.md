# Cancer Classification — Project Roadmap
> Sprint-based execution from zero to a fully evaluated ML system

---

## 🗓️ Timeline Overview

```
Week 1                    Week 2                    Week 3
├── Day 1–2               ├── Day 8–9               ├── Day 15–16
│   Setup + EDA           │   Tuning + Ensemble      │   SHAP + Reports
├── Day 3–4               ├── Day 10–11              ├── Day 17–18
│   Preprocessing         │   ANN Training           │   Final Evaluation
├── Day 5–7               ├── Day 12–14              └── Day 19–21
│   Core Models (SVM,RF,  │   Stacking Ensemble          Polish + README
│   XGBoost)              │   + Validation
```

---

## Sprint 1 — Foundation
**Days 1–4 | Deliverable: Clean data ready for modeling**

### Day 1 — Setup
- [ ] Install Python 3.10+, create virtualenv
- [ ] Install all packages from `requirements.txt`
- [ ] Create full project directory structure
- [ ] Initialize Git, make first commit
- [ ] Verify: `import sklearn, xgboost, shap, tensorflow` — no errors

**Done when:** `python -c "from sklearn.datasets import load_breast_cancer; print('ready')"` prints `ready`

---

### Day 2 — EDA
- [ ] Load dataset (sklearn built-in, no download needed)
- [ ] Generate class distribution plot → save to `reports/figures/class_dist.png`
- [ ] Correlation heatmap of all 30 features → save to `reports/figures/corr_heatmap.png`
- [ ] Box plots top 10 features by class → `reports/figures/boxplots.png`
- [ ] Write EDA summary markdown in `notebooks/01_eda.ipynb`
- [ ] Note top 5 most discriminative features for later

**Done when:** 5+ charts saved, EDA notebook complete

---

### Day 3 — Preprocessing
- [ ] Implement stratified 80/20 train/test split
- [ ] Fit `StandardScaler` on train only, transform both sets
- [ ] Save scaler as `models/scaler.pkl`
- [ ] Save processed arrays to `data/processed/`
- [ ] Verify: no data leakage, class ratios preserved in both splits
- [ ] Optional: run `SelectKBest` to rank feature importance

**Done when:** `X_train.npy`, `X_test.npy`, `y_train.npy`, `y_test.npy` all saved

---

### Day 4 — Baseline Models (Quick Pass)
Run all 3 classical models with default params to get baseline numbers:
- [ ] SVM (RBF kernel, default C)
- [ ] Random Forest (100 trees)
- [ ] Gradient Boosting / XGBoost (default)
- [ ] Record baseline metrics in `reports/results.csv`

**Done when:** You have a populated results table with 3 rows

---

## Sprint 2 — Model Optimization
**Days 5–11 | Deliverable: All 5 models tuned and evaluated**

### Day 5–6 — SVM Tuning
- [ ] Run `GridSearchCV` over `C`, `kernel`, `gamma`
- [ ] Evaluate best SVM on test set
- [ ] Plot: ROC curve, confusion matrix
- [ ] Save: `models/svm.pkl`

**Target:** Recall (malignant) ≥ 0.97, AUC-ROC ≥ 0.98

---

### Day 7 — Random Forest Tuning
- [ ] Run `GridSearchCV` over `n_estimators`, `max_depth`, `min_samples_split`
- [ ] Plot: feature importances bar chart
- [ ] Save: `models/rf.pkl`

**Target:** Recall ≥ 0.96, identifies top features correctly

---

### Day 8 — XGBoost Tuning
- [ ] Run `RandomizedSearchCV` over `learning_rate`, `n_estimators`, `max_depth`, `subsample`
- [ ] Plot: ROC curve vs SVM/RF
- [ ] Save: `models/xgb.pkl`

**Target:** Highest accuracy of the 3 classical models

---

### Day 9–10 — ANN Training
- [ ] Build Keras Sequential model (see `models.md` for architecture)
- [ ] Train with `EarlyStopping` + `ReduceLROnPlateau`
- [ ] Plot: training/validation loss curves, accuracy curves
- [ ] Save: `models/ann.h5`

**Target:** Val accuracy ≥ 97%, no overfitting (train ≈ val loss)

---

### Day 11 — Comparison Checkpoint
- [ ] Update `reports/results.csv` with all 4 models
- [ ] Identify top 3 models by Recall (malignant)
- [ ] Decide ensemble composition: which 3 models to combine

**Done when:** You know your top-3 performers

---

## Sprint 3 — Ensemble + Explainability
**Days 12–16 | Deliverable: Best model + explainability report**

### Day 12–13 — Ensemble
- [ ] Build Soft Voting Classifier with top-3 models
- [ ] Build Stacking Classifier (LR meta-learner)
- [ ] Compare: Voting vs Stacking vs individual models
- [ ] Save best ensemble: `models/ensemble.pkl`

**Target:** Ensemble recall ≥ 0.98, best overall AUC-ROC

---

### Day 14 — Cross-Validation Robustness Check
- [ ] Run `StratifiedKFold` (k=5) on best model
- [ ] Report mean ± std for: Accuracy, Recall, F1, AUC-ROC
- [ ] Confirm model is not overfit to the test split

---

### Day 15–16 — SHAP Explainability
- [ ] Generate SHAP values for best RF or XGBoost
- [ ] Summary plot (global feature importance)
- [ ] Waterfall plot (single prediction explanation)
- [ ] Identify top 5 features driving malignant predictions
- [ ] Save plots to `reports/figures/shap_*.png`

---

## Sprint 4 — Final Polish
**Days 17–21 | Deliverable: Production-ready project**

### Day 17–18 — Final Evaluation
- [ ] Run all 5 final models on held-out test set
- [ ] Fill complete `reports/results.csv` table
- [ ] Identify WINNER model (best recall + AUC-ROC combo)
- [ ] Write 1-page findings summary

### Day 19–20 — Documentation
- [ ] Complete `README.md` with: project overview, setup, usage, results
- [ ] Add docstrings to all `src/` files
- [ ] Clean all notebooks, re-run from scratch to verify reproducibility

### Day 21 — Final Commit
- [ ] Tag release `v1.0`
- [ ] Push to GitHub
- [ ] Archive `reports/` with all figures and results

---

## 🚦 Go/No-Go Criteria

| Checkpoint | Pass Condition |
|---|---|
| End of Sprint 1 | Preprocessed data saved, no leakage confirmed |
| End of Sprint 2 | All 4 models trained, recall ≥ 0.95 for malignant |
| End of Sprint 3 | Ensemble beats all individuals, SHAP plots generated |
| End of Sprint 4 | Reproducible from clean install, all metrics documented |

---

## 🔴 Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| ANN overfits | Medium | EarlyStopping + Dropout (see models.md) |
| Class imbalance causes low recall | Low | `class_weight='balanced'` on all models |
| Data leakage from scaling | Medium | Always fit scaler on train only |
| Hyperparameter search too slow | Medium | Use `RandomizedSearchCV` for XGBoost/ANN |
| Models don't generalize | Low | 5-fold StratifiedKFold cross-validation |
