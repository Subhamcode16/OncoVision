import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.datasets import load_breast_cancer
import os

# Set style for premium plots
plt.style.use('ggplot')
sns.set_palette("viridis")

def run_eda():
    print("--- Starting Phase 1: Data Acquisition ---")
    # Load dataset
    data = load_breast_cancer()
    df = pd.DataFrame(data.data, columns=data.feature_names)
    df['target'] = data.target # 0=malignant, 1=benign
    
    # Save raw data
    raw_path = 'data/raw/breast_cancer.csv'
    df.to_csv(raw_path, index=False)
    print(f"Dataset loaded. Shape: {df.shape}. Saved to {raw_path}")
    
    print("\n--- Starting Phase 2: Exploratory Data Analysis ---")
    
    # 1. Class Distribution
    plt.figure(figsize=(8, 6))
    sns.countplot(x='target', data=df)
    plt.title('Class Distribution (0: Malignant, 1: Benign)', fontsize=14)
    plt.xlabel('Diagnosis', fontsize=12)
    plt.ylabel('Count', fontsize=12)
    plt.savefig('reports/figures/class_dist.png', dpi=150)
    plt.close()
    print("Saved class distribution plot.")

    # 2. Correlation Heatmap
    plt.figure(figsize=(20, 16))
    corr = df.corr()
    mask = np.triu(np.ones_like(corr, dtype=bool))
    sns.heatmap(corr, mask=mask, annot=False, cmap='coolwarm', center=0, square=True, linewidths=.5)
    plt.title('Feature Correlation Heatmap', fontsize=18)
    plt.savefig('reports/figures/corr_heatmap.png', dpi=150)
    plt.close()
    print("Saved correlation heatmap.")

    # 3. Boxplots for top features (based on correlation with target)
    top_corr_features = corr['target'].abs().sort_values(ascending=False)[1:11].index.tolist()
    
    plt.figure(figsize=(15, 12))
    for i, feature in enumerate(top_corr_features):
        plt.subplot(4, 3, i+1)
        sns.boxplot(x='target', y=feature, data=df)
        plt.title(f'{feature} vs Target', fontsize=10)
    
    plt.tight_layout()
    plt.savefig('reports/figures/boxplots.png', dpi=150)
    plt.close()
    print(f"Saved boxplots for top 10 features: {top_corr_features}")

    # Summary Stats
    summary = df.describe().T
    summary.to_csv('reports/summary_stats.csv')
    print("Saved summary statistics to reports/summary_stats.csv")

if __name__ == "__main__":
    # Ensure directories exist
    os.makedirs('reports/figures', exist_ok=True)
    os.makedirs('data/raw', exist_ok=True)
    run_eda()
