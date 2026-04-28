# Cancer Classification — Requirements
> Full list of tools, packages, hardware, and knowledge prerequisites

---

## 1. System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| Python | 3.9 | 3.10 or 3.11 |
| RAM | 4 GB | 8 GB |
| Storage | 1 GB | 5 GB |
| GPU | Not required | NVIDIA GPU (for ANN training speed) |
| OS | Windows 10 / Ubuntu 20.04 / macOS 12 | Ubuntu 22.04 |

---

## 2. Python Packages

### Install Everything at Once
```bash
pip install -r requirements.txt
```

### `requirements.txt` (copy this file directly)
```
# Core Data Science
numpy==1.26.4
pandas==2.2.1
scipy==1.13.0

# Visualization
matplotlib==3.8.4
seaborn==0.13.2
plotly==5.21.0

# Machine Learning
scikit-learn==1.4.2
xgboost==2.0.3
lightgbm==4.3.0
imbalanced-learn==0.12.2

# Deep Learning (ANN)
tensorflow==2.16.1
keras==3.3.3

# Explainability
shap==0.45.1
lime==0.2.0.1

# Model Persistence
joblib==1.4.0

# Notebook Support
jupyter==1.0.0
ipykernel==6.29.4
ipywidgets==8.1.2

# Progress + Utilities
tqdm==4.66.2
python-dotenv==1.0.1
```

### Install Command
```bash
# Create and activate virtual environment first
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install packages
pip install numpy pandas scipy matplotlib seaborn plotly scikit-learn xgboost lightgbm imbalanced-learn tensorflow keras shap lime joblib jupyter ipykernel ipywidgets tqdm

# Verify core installs
python -c "import sklearn, xgboost, shap, tensorflow; print('All packages installed successfully')"
```

---

## 3. Dataset Requirements

### Primary Dataset (No Download Needed)
```python
# Built into scikit-learn — available immediately
from sklearn.datasets import load_breast_cancer
data = load_breast_cancer()
# Shape: (569, 30) features, binary target (0=malignant, 1=benign)
```

### Optional: Download CSV from Kaggle
- URL: https://www.kaggle.com/datasets/uciml/breast-cancer-wisconsin-data
- File: `data.csv` (~45 KB)
- Requires: Free Kaggle account

### Optional: UCI Repository (API)
```bash
pip install ucimlrepo
```
```python
from ucimlrepo import fetch_ucirepo
dataset = fetch_ucirepo(id=17)   # Diagnostic version (recommended)
# dataset = fetch_ucirepo(id=15) # Original version
X = dataset.data.features
y = dataset.data.targets
```

---

## 4. Development Environment

### Option A — Jupyter Notebooks (Recommended for Beginners)
```bash
jupyter notebook
# Open notebooks/ folder, run cells sequentially
```

### Option B — VS Code
- Install: Python extension, Jupyter extension
- Select interpreter: `./venv/bin/python`
- Run notebooks inline or as `.py` scripts

### Option C — Google Colab (Zero Setup)
```python
# Paste at top of any Colab cell
from sklearn.datasets import load_breast_cancer
# All other packages pre-installed in Colab
```

---

## 5. Knowledge Prerequisites

### Required (Must Know)
- Python basics: loops, functions, classes, imports
- NumPy: arrays, slicing, reshaping
- Pandas: DataFrames, groupby, merge
- Basic ML concepts: train/test split, overfitting, cross-validation

### Helpful (Good to Know)
- Matplotlib / Seaborn: plotting and visualization
- Scikit-learn API: `fit()`, `predict()`, `predict_proba()`
- Confusion matrix: TP, TN, FP, FN definitions
- What Precision / Recall / F1 mean

### Not Required (Will Be Explained in Code)
- SHAP values — explained in comments
- Ensemble methods — explained in `models.md`
- ANN architecture — fully defined in `models.md`

---

## 6. Key Concepts Quick Reference

### Why StandardScaler?
SVM is highly sensitive to feature scale. Without scaling, features with large ranges (like `area_mean` ~1000) dominate over small-range features (`smoothness_mean` ~0.1). StandardScaler transforms each feature to mean=0, std=1.

### Why Stratified Split?
`stratify=y` ensures both train and test sets have the same malignant/benign ratio (~37%/63%). Without it, random chance could give you a test set with very few malignant samples.

### Why Recall Over Accuracy?
In cancer detection, a **false negative** (predicting benign when it's actually malignant) is far more dangerous than a **false positive**. Recall = TP / (TP + FN). Maximizing recall for the malignant class minimizes missed cancers.

### Why Ensemble?
Individual models each have blind spots. Combining SVM (margin-based), RF (tree-based), and XGBoost (gradient-based) through soft voting averages their probability estimates — reducing variance and improving robustness.

---

## 7. Folder Setup Commands

Run once at the beginning:
```bash
mkdir -p cancer_classification/{data/{raw,processed},notebooks,src,models,reports/figures}
cd cancer_classification
touch src/__init__.py src/preprocess.py src/train.py src/evaluate.py src/explain.py src/ensemble.py
touch reports/results.csv
touch README.md
git init
echo "venv/\n__pycache__/\n*.pyc\n.DS_Store\nmodels/*.pkl\nmodels/*.h5" > .gitignore
git add .
git commit -m "Initial project structure"
```

---

## 8. Verification Checklist

Run this block before starting Phase 1:
```python
# verify_setup.py
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import sklearn
import xgboost
import shap
import tensorflow as tf
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, StackingClassifier
from sklearn.metrics import classification_report, roc_auc_score

data = load_breast_cancer()
print(f"scikit-learn: {sklearn.__version__}")
print(f"XGBoost: {xgboost.__version__}")
print(f"TensorFlow: {tf.__version__}")
print(f"SHAP: {shap.__version__}")
print(f"Dataset loaded: {data.data.shape}")
print("\n✅ ALL SYSTEMS GO — Ready to start training")
```
