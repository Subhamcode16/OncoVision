# Cancer Classification — Execution Plan
> **Project:** Cancer Classification Using Machine Learning  
> **Goal:** Classify tumors as Benign or Malignant  
> **Dataset:** Breast Cancer Wisconsin (Diagnostic) — UCI / sklearn  
> **Target Metric:** Recall ≥ 0.97 for Malignant class

---

## Phase 0 — Environment Setup
**Est. Time: 30 mins**

- [ ] Create project directory structure (see below)
- [ ] Set up Python virtual environment (`python -m venv venv`)
- [ ] Install all dependencies from `requirements.md`
- [ ] Verify GPU availability (optional, needed for ANN)
- [ ] Initialize Git repo + `.gitignore`

### Directory Structure
```
cancer_classification/
├── data/
│   ├── raw/                  # original CSVs
│   └── processed/            # scaled, split datasets
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_preprocessing.ipynb
│   ├── 03_models.ipynb
│   └── 04_ensemble.ipynb
├── src/
│   ├── __init__.py
│   ├── preprocess.py         # scaling, splitting, SMOTE
│   ├── train.py              # model training loop
│   ├── evaluate.py           # metrics, confusion matrix
│   ├── explain.py            # SHAP values
│   └── ensemble.py           # voting + stacking
├── models/
│   ├── svm.pkl
│   ├── rf.pkl
│   ├── xgb.pkl
│   ├── ann.h5
│   └── ensemble.pkl
├── reports/
│   ├── figures/
│   └── results.csv           # all model metrics
├── requirements.txt
└── README.md
```

---

## Phase 1 — Data Acquisition & EDA
**Est. Time: 2–3 hours**

### Step 1.1 — Load Dataset
```python
from sklearn.datasets import load_breast_cancer
import pandas as pd

data = load_breast_cancer()
df = pd.DataFrame(data.data, columns=data.feature_names)
df['target'] = data.target  # 0=malignant, 1=benign
df.to_csv('data/raw/breast_cancer.csv', index=False)
```

### Step 1.2 — EDA Checklist
- [ ] `df.shape`, `df.info()`, `df.describe()` — basic sanity check
- [ ] `df.isnull().sum()` — confirm zero missing values
- [ ] Class distribution bar chart — check imbalance (~63% benign / ~37% malignant)
- [ ] Correlation heatmap — identify highly correlated features (>0.95)
- [ ] Box plots for top 10 features: benign vs malignant distributions
- [ ] Pairplot on top 5 features colored by class
- [ ] Save all figures to `reports/figures/`

### Step 1.3 — Key EDA Findings to Note
- Features like `radius_mean`, `perimeter_mean`, `area_mean` are highly correlated — consider dropping redundant ones
- `_worst` features tend to be stronger predictors than `_mean`
- No class balancing strictly needed (ratio is acceptable), but apply `class_weight='balanced'` in models

---

## Phase 2 — Preprocessing Pipeline
**Est. Time: 1–2 hours**

### Step 2.1 — Train/Test Split
```python
from sklearn.model_selection import train_test_split

X = df.drop('target', axis=1)
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
# Train: ~455 samples | Test: ~114 samples
```

### Step 2.2 — Feature Scaling
```python
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)   # fit ONLY on train
X_test_scaled = scaler.transform(X_test)          # transform test

import joblib
joblib.dump(scaler, 'models/scaler.pkl')
```
> ⚠️ **Critical:** Never fit the scaler on the full dataset — that's data leakage.

### Step 2.3 — Feature Selection (Optional but Recommended)
```python
from sklearn.feature_selection import SelectKBest, f_classif

selector = SelectKBest(f_classif, k=20)
X_train_selected = selector.fit_transform(X_train_scaled, y_train)
X_test_selected = selector.transform(X_test_scaled)
```

### Step 2.4 — Save Processed Data
```python
import numpy as np
np.save('data/processed/X_train.npy', X_train_scaled)
np.save('data/processed/X_test.npy', X_test_scaled)
np.save('data/processed/y_train.npy', y_train)
np.save('data/processed/y_test.npy', y_test)
```

---

## Phase 3 — Model Training
**Est. Time: 3–4 hours**

Train each model individually. Full configs in `models.md`.

### Order of Training
1. **SVM** — fastest baseline, usually best on this dataset
2. **Random Forest** — good feature importance output
3. **Gradient Boosting (XGBoost)** — highest accuracy candidate
4. **ANN** — deepest learning approach
5. **Ensemble** — combine best 3 models

### Evaluation After Each Model
```python
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

def evaluate_model(model, X_test, y_test, name):
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print(f"\n{'='*40}")
    print(f"Model: {name}")
    print(classification_report(y_test, y_pred, target_names=['Malignant', 'Benign']))
    print(f"AUC-ROC: {roc_auc_score(y_test, y_prob):.4f}")
    print(confusion_matrix(y_test, y_pred))
```

---

## Phase 4 — Hyperparameter Tuning
**Est. Time: 2–3 hours**

Use `GridSearchCV` with `scoring='recall'` to optimize for detecting malignant cases.

```python
from sklearn.model_selection import GridSearchCV, StratifiedKFold

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

grid_search = GridSearchCV(
    estimator=model,
    param_grid=param_grid,       # see models.md for each model's grid
    cv=cv,
    scoring='recall',            # PRIMARY metric: minimize false negatives
    n_jobs=-1,
    verbose=1
)
grid_search.fit(X_train_scaled, y_train)
print("Best params:", grid_search.best_params_)
```

---

## Phase 5 — Ensemble Building
**Est. Time: 1–2 hours**

### Soft Voting (Recommended First)
```python
from sklearn.ensemble import VotingClassifier

ensemble = VotingClassifier(
    estimators=[
        ('svm', best_svm),
        ('rf', best_rf),
        ('xgb', best_xgb)
    ],
    voting='soft'
)
ensemble.fit(X_train_scaled, y_train)
```

### Stacking (Advanced)
```python
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression

stacking = StackingClassifier(
    estimators=[('svm', best_svm), ('rf', best_rf), ('xgb', best_xgb)],
    final_estimator=LogisticRegression(),
    cv=5
)
```

---

## Phase 6 — Explainability (SHAP)
**Est. Time: 1 hour**

```python
import shap

explainer = shap.TreeExplainer(best_rf)   # or best_xgb
shap_values = explainer.shap_values(X_test_scaled)

# Summary plot — global feature importance
shap.summary_plot(shap_values, X_test_scaled, feature_names=data.feature_names)

# Force plot — single prediction explanation
shap.force_plot(explainer.expected_value[1], shap_values[1][0], X_test_scaled[0])
```

---

## Phase 7 — Results Compilation
**Est. Time: 30 mins**

Compile all model results into `reports/results.csv`:

| Model | Accuracy | Precision | Recall (Malignant) | F1 | AUC-ROC |
|---|---|---|---|---|---|
| SVM | | | | | |
| Random Forest | | | | | |
| XGBoost | | | | | |
| ANN | | | | | |
| Ensemble | | | | | |

**Expected benchmarks:** All models should hit 96–99% accuracy. Recall for malignant class is the critical number — target ≥ 0.97.

---

## Total Estimated Time
| Phase | Time |
|---|---|
| Environment Setup | 30 min |
| EDA | 2–3 hr |
| Preprocessing | 1–2 hr |
| Model Training | 3–4 hr |
| Tuning | 2–3 hr |
| Ensemble | 1–2 hr |
| SHAP + Reports | 1.5 hr |
| **Total** | **~12–15 hr** |
