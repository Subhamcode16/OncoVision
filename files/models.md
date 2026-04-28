# Cancer Classification — Models Reference
> Complete architecture, hyperparameter grids, training code, and evaluation for all 5 models

---

## Overview

| # | Model | Library | Best For | Expected Accuracy |
|---|---|---|---|---|
| 1 | Support Vector Machine | scikit-learn | High-dimensional, small dataset | 97–98% |
| 2 | Random Forest | scikit-learn | Feature importance + robustness | 96–97% |
| 3 | XGBoost (Gradient Boosting) | xgboost | Best raw accuracy | 97–98% |
| 4 | Artificial Neural Network | TensorFlow/Keras | Deep pattern learning | 96–98% |
| 5 | Ensemble (Voting + Stacking) | scikit-learn | Overall best system | 98–99% |

**Primary optimization target:** `recall` for the malignant class (label = 0)

---

## Shared Evaluation Function
> Use after every single model

```python
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_auc_score, roc_curve, precision_recall_curve,
    ConfusionMatrixDisplay
)

def evaluate_model(model, X_test, y_test, model_name, results_log=None):
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    report = classification_report(
        y_test, y_pred,
        target_names=['Malignant (0)', 'Benign (1)'],
        output_dict=True
    )

    auc = roc_auc_score(y_test, y_prob)

    print(f"\n{'='*50}")
    print(f"  MODEL: {model_name}")
    print(f"{'='*50}")
    print(classification_report(y_test, y_pred, target_names=['Malignant', 'Benign']))
    print(f"  AUC-ROC: {auc:.4f}")

    # Confusion Matrix
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    ConfusionMatrixDisplay.from_predictions(
        y_test, y_pred,
        display_labels=['Malignant', 'Benign'],
        ax=axes[0], colorbar=False, cmap='Blues'
    )
    axes[0].set_title(f'{model_name} — Confusion Matrix')

    # ROC Curve
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    axes[1].plot(fpr, tpr, label=f'AUC = {auc:.3f}', linewidth=2)
    axes[1].plot([0, 1], [0, 1], 'k--')
    axes[1].set_xlabel('False Positive Rate')
    axes[1].set_ylabel('True Positive Rate')
    axes[1].set_title(f'{model_name} — ROC Curve')
    axes[1].legend()

    plt.tight_layout()
    plt.savefig(f'reports/figures/{model_name.lower().replace(" ", "_")}_eval.png', dpi=150)
    plt.show()

    if results_log is not None:
        results_log.append({
            'Model': model_name,
            'Accuracy': report['accuracy'],
            'Precision_Malignant': report['Malignant (0)']['precision'],
            'Recall_Malignant': report['Malignant (0)']['recall'],
            'F1_Malignant': report['Malignant (0)']['f1-score'],
            'AUC_ROC': auc
        })

    return report, auc
```

---

## Model 1 — Support Vector Machine (SVM)

**Why SVM?** Excellent on small, well-scaled datasets. Finds the maximum-margin hyperplane between classes. RBF kernel handles non-linear separation.

### Architecture
- **Kernel:** RBF (Radial Basis Function)
- **Key params:** `C` (regularization), `gamma` (kernel width)
- **Requires:** StandardScaler preprocessing

### Baseline Training
```python
from sklearn.svm import SVC

svm_base = SVC(kernel='rbf', probability=True, random_state=42, class_weight='balanced')
svm_base.fit(X_train_scaled, y_train)
evaluate_model(svm_base, X_test_scaled, y_test, "SVM Baseline", results_log)
```

### Hyperparameter Tuning
```python
from sklearn.model_selection import GridSearchCV, StratifiedKFold

svm_param_grid = {
    'C': [0.1, 1, 10, 100, 1000],
    'gamma': ['scale', 'auto', 0.001, 0.01, 0.1],
    'kernel': ['rbf', 'linear']
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

svm_grid = GridSearchCV(
    SVC(probability=True, class_weight='balanced', random_state=42),
    svm_param_grid,
    cv=cv,
    scoring='recall',      # optimize for catching malignant cases
    n_jobs=-1,
    verbose=1
)
svm_grid.fit(X_train_scaled, y_train)

print("Best SVM params:", svm_grid.best_params_)
best_svm = svm_grid.best_estimator_
evaluate_model(best_svm, X_test_scaled, y_test, "SVM Tuned", results_log)
```

### Save Model
```python
import joblib
joblib.dump(best_svm, 'models/svm.pkl')
```

### Expected Output
- Accuracy: 97–98%
- Recall (Malignant): 0.97–0.99
- AUC-ROC: 0.997+
- Best params typically: `C=10`, `gamma='scale'`, `kernel='rbf'`

---

## Model 2 — Random Forest

**Why RF?** Ensemble of decision trees, resistant to overfitting, provides native feature importance. No scaling required but apply anyway for consistency.

### Architecture
- **Type:** Bagging ensemble of decision trees
- **Key params:** `n_estimators`, `max_depth`, `min_samples_split`
- **Bonus output:** Feature importances for SHAP comparison

### Baseline Training
```python
from sklearn.ensemble import RandomForestClassifier

rf_base = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight='balanced'
)
rf_base.fit(X_train_scaled, y_train)
evaluate_model(rf_base, X_test_scaled, y_test, "Random Forest Baseline", results_log)
```

### Hyperparameter Tuning
```python
rf_param_grid = {
    'n_estimators': [100, 200, 300, 500],
    'max_depth': [None, 5, 10, 20],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'max_features': ['sqrt', 'log2']
}

rf_grid = GridSearchCV(
    RandomForestClassifier(random_state=42, class_weight='balanced'),
    rf_param_grid,
    cv=cv,
    scoring='recall',
    n_jobs=-1,
    verbose=1
)
rf_grid.fit(X_train_scaled, y_train)

print("Best RF params:", rf_grid.best_params_)
best_rf = rf_grid.best_estimator_
evaluate_model(best_rf, X_test_scaled, y_test, "Random Forest Tuned", results_log)
```

### Feature Importance Plot
```python
import pandas as pd
feature_names = load_breast_cancer().feature_names

importances = pd.Series(
    best_rf.feature_importances_,
    index=feature_names
).sort_values(ascending=False)

plt.figure(figsize=(10, 8))
importances.head(15).plot(kind='barh')
plt.title('Random Forest — Top 15 Feature Importances')
plt.xlabel('Importance Score')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.savefig('reports/figures/rf_feature_importance.png', dpi=150)
plt.show()
```

### Save Model
```python
joblib.dump(best_rf, 'models/rf.pkl')
```

### Expected Output
- Accuracy: 96–97%
- Recall (Malignant): 0.96–0.98
- AUC-ROC: 0.994+
- Top features: `worst_concave_points`, `worst_radius`, `worst_perimeter`

---

## Model 3 — XGBoost (Gradient Boosting)

**Why XGBoost?** Sequentially corrects errors of previous trees. Typically highest accuracy on tabular data. Built-in regularization prevents overfitting.

### Architecture
- **Type:** Boosting ensemble
- **Key params:** `learning_rate`, `n_estimators`, `max_depth`, `subsample`
- **Regularization:** `reg_alpha` (L1), `reg_lambda` (L2)

### Baseline Training
```python
from xgboost import XGBClassifier

xgb_base = XGBClassifier(
    n_estimators=100,
    random_state=42,
    eval_metric='logloss',
    use_label_encoder=False
)
xgb_base.fit(X_train_scaled, y_train)
evaluate_model(xgb_base, X_test_scaled, y_test, "XGBoost Baseline", results_log)
```

### Hyperparameter Tuning (RandomizedSearch — faster)
```python
from sklearn.model_selection import RandomizedSearchCV

xgb_param_dist = {
    'n_estimators': [100, 200, 300, 500],
    'max_depth': [3, 4, 5, 6, 7],
    'learning_rate': [0.01, 0.05, 0.1, 0.2, 0.3],
    'subsample': [0.7, 0.8, 0.9, 1.0],
    'colsample_bytree': [0.7, 0.8, 0.9, 1.0],
    'reg_alpha': [0, 0.1, 0.5, 1.0],
    'reg_lambda': [1, 1.5, 2.0],
    'min_child_weight': [1, 3, 5]
}

xgb_rand = RandomizedSearchCV(
    XGBClassifier(random_state=42, eval_metric='logloss', use_label_encoder=False),
    xgb_param_dist,
    n_iter=50,             # tries 50 random combinations
    cv=cv,
    scoring='recall',
    n_jobs=-1,
    random_state=42,
    verbose=1
)
xgb_rand.fit(X_train_scaled, y_train)

print("Best XGBoost params:", xgb_rand.best_params_)
best_xgb = xgb_rand.best_estimator_
evaluate_model(best_xgb, X_test_scaled, y_test, "XGBoost Tuned", results_log)
```

### Save Model
```python
joblib.dump(best_xgb, 'models/xgb.pkl')
# or native format:
best_xgb.save_model('models/xgb_model.json')
```

### Expected Output
- Accuracy: 97–98%
- Recall (Malignant): 0.97–0.99
- AUC-ROC: 0.997+

---

## Model 4 — Artificial Neural Network (ANN)

**Why ANN?** Learns non-linear feature interactions automatically. With dropout and batch normalization, achieves competitive performance.

### Architecture Design
```
Input Layer:    30 neurons  (one per feature)
      ↓
Dense Layer 1:  128 neurons, ReLU activation
BatchNorm → Dropout(0.3)
      ↓
Dense Layer 2:  64 neurons, ReLU activation
BatchNorm → Dropout(0.3)
      ↓
Dense Layer 3:  32 neurons, ReLU activation
Dropout(0.2)
      ↓
Output Layer:   1 neuron, Sigmoid activation (binary classification)
```

### Full Training Code
```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks
import numpy as np

# Reproducibility
tf.random.set_seed(42)
np.random.seed(42)

def build_ann(input_dim=30, learning_rate=0.001):
    model = keras.Sequential([
        # Input
        layers.Input(shape=(input_dim,)),

        # Block 1
        layers.Dense(128, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
        layers.BatchNormalization(),
        layers.Dropout(0.3),

        # Block 2
        layers.Dense(64, activation='relu', kernel_regularizer=keras.regularizers.l2(0.001)),
        layers.BatchNormalization(),
        layers.Dropout(0.3),

        # Block 3
        layers.Dense(32, activation='relu'),
        layers.Dropout(0.2),

        # Output
        layers.Dense(1, activation='sigmoid')
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=learning_rate),
        loss='binary_crossentropy',
        metrics=['accuracy', keras.metrics.Recall(name='recall'), keras.metrics.AUC(name='auc')]
    )
    return model

ann = build_ann()
ann.summary()

# Callbacks
callback_list = [
    callbacks.EarlyStopping(
        monitor='val_recall',
        patience=20,
        restore_best_weights=True,
        mode='max'
    ),
    callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=10,
        min_lr=1e-6,
        verbose=1
    ),
    callbacks.ModelCheckpoint(
        'models/ann_best.h5',
        monitor='val_recall',
        save_best_only=True,
        mode='max'
    )
]

# Class weights to handle imbalance
from sklearn.utils.class_weight import compute_class_weight
class_weights = compute_class_weight(
    'balanced', classes=np.unique(y_train), y=y_train
)
class_weight_dict = {0: class_weights[0], 1: class_weights[1]}

# Train
history = ann.fit(
    X_train_scaled, y_train,
    epochs=200,
    batch_size=32,
    validation_split=0.2,
    class_weight=class_weight_dict,
    callbacks=callback_list,
    verbose=1
)
```

### Plot Training History
```python
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

axes[0].plot(history.history['loss'], label='Train Loss')
axes[0].plot(history.history['val_loss'], label='Val Loss')
axes[0].set_title('Loss Curves')
axes[0].legend()

axes[1].plot(history.history['accuracy'], label='Train Acc')
axes[1].plot(history.history['val_accuracy'], label='Val Acc')
axes[1].set_title('Accuracy Curves')
axes[1].legend()

axes[2].plot(history.history['recall'], label='Train Recall')
axes[2].plot(history.history['val_recall'], label='Val Recall')
axes[2].set_title('Recall Curves')
axes[2].legend()

plt.tight_layout()
plt.savefig('reports/figures/ann_training_history.png', dpi=150)
plt.show()
```

### ANN Evaluation (Wrapper for Consistency)
```python
class ANNWrapper:
    """Wraps Keras model to work with sklearn-style evaluate_model function"""
    def __init__(self, keras_model, threshold=0.5):
        self.model = keras_model
        self.threshold = threshold

    def predict(self, X):
        return (self.model.predict(X) >= self.threshold).astype(int).flatten()

    def predict_proba(self, X):
        probs = self.model.predict(X).flatten()
        return np.column_stack([1 - probs, probs])

ann_wrapped = ANNWrapper(ann)
evaluate_model(ann_wrapped, X_test_scaled, y_test, "ANN", results_log)
```

### Expected Output
- Accuracy: 96–98%
- Recall (Malignant): 0.96–0.98
- AUC-ROC: 0.994+
- Training time: ~30–60 seconds (CPU)

---

## Model 5 — Ensemble Learning

### Option A: Soft Voting Classifier
Averages predicted probabilities from all 3 best models. Reduces individual model variance.

```python
from sklearn.ensemble import VotingClassifier

voting_ensemble = VotingClassifier(
    estimators=[
        ('svm', best_svm),
        ('rf', best_rf),
        ('xgb', best_xgb)
    ],
    voting='soft',          # uses predicted probabilities, not just labels
    weights=[1, 1, 1]       # equal weights — adjust if one model dominates
)

voting_ensemble.fit(X_train_scaled, y_train)
evaluate_model(voting_ensemble, X_test_scaled, y_test, "Voting Ensemble", results_log)
joblib.dump(voting_ensemble, 'models/voting_ensemble.pkl')
```

### Option B: Stacking Classifier (More Powerful)
Base models generate predictions → meta-learner combines them.

```python
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression

stacking_ensemble = StackingClassifier(
    estimators=[
        ('svm', best_svm),
        ('rf', best_rf),
        ('xgb', best_xgb)
    ],
    final_estimator=LogisticRegression(
        C=1.0,
        class_weight='balanced',
        random_state=42
    ),
    cv=5,
    stack_method='predict_proba',
    passthrough=False       # set True to also pass original features to meta-learner
)

stacking_ensemble.fit(X_train_scaled, y_train)
evaluate_model(stacking_ensemble, X_test_scaled, y_test, "Stacking Ensemble", results_log)
joblib.dump(stacking_ensemble, 'models/stacking_ensemble.pkl')
```

### Expected Output
- Accuracy: 98–99%
- Recall (Malignant): 0.98–1.00
- AUC-ROC: 0.998+

---

## SHAP Explainability

```python
import shap

# Best for RF and XGBoost (TreeExplainer — fast)
explainer = shap.TreeExplainer(best_xgb)
shap_values = explainer.shap_values(X_test_scaled)

feature_names = list(load_breast_cancer().feature_names)

# Global: which features matter most
plt.figure(figsize=(10, 8))
shap.summary_plot(shap_values, X_test_scaled, feature_names=feature_names, show=False)
plt.tight_layout()
plt.savefig('reports/figures/shap_summary.png', dpi=150)
plt.show()

# Local: explain a single prediction
sample_idx = 0
shap.waterfall_plot(
    shap.Explanation(
        values=shap_values[sample_idx],
        base_values=explainer.expected_value,
        data=X_test_scaled[sample_idx],
        feature_names=feature_names
    )
)
```

---

## Cross-Validation — Final Robustness Check

Run on your best model before final reporting:

```python
from sklearn.model_selection import cross_validate

cv_results = cross_validate(
    best_model,           # replace with your winner
    X_train_scaled,
    y_train,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring={
        'accuracy': 'accuracy',
        'recall': 'recall',
        'precision': 'precision',
        'f1': 'f1',
        'roc_auc': 'roc_auc'
    },
    return_train_score=True
)

for metric, values in cv_results.items():
    if metric.startswith('test_'):
        print(f"{metric[5:]:12s}: {np.mean(values):.4f} ± {np.std(values):.4f}")
```

---

## Final Results Compilation

```python
import pandas as pd

results_df = pd.DataFrame(results_log)
results_df = results_df.sort_values('Recall_Malignant', ascending=False)
results_df.to_csv('reports/results.csv', index=False)

print("\n" + "="*60)
print("  FINAL MODEL COMPARISON")
print("="*60)
print(results_df.to_string(index=False))
print("\nWINNER:", results_df.iloc[0]['Model'])
```
