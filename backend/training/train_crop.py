import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
import requests

DATA_DIR = "../datasets"
DATA_PATH = os.path.join(DATA_DIR, "Crop_recommendation.csv")
MODEL_DIR = "../models"
GRAPH_DIR = "../graphs"

def download_csv_if_missing():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATA_PATH):
        print(f"Downloading Crop Recommendation Dataset to {DATA_PATH}...")
        url = "https://raw.githubusercontent.com/arzzahid66/Optimizing_Agricultural_Production/master/Crop_recommendation.csv"
        response = requests.get(url)
        with open(DATA_PATH, 'wb') as f:
            f.write(response.content)
        print("Download Complete.")

def train_and_plot():
    download_csv_if_missing()
    
    print("Loading Crop Recommendation Data...")
    df = pd.read_csv(DATA_PATH)
    
    # Check for nulls
    df.dropna(inplace=True)
    
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    
    y_pred = rf_model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy (Random Forest): {acc * 100:.2f}%")
    
    # Save Model
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(GRAPH_DIR, exist_ok=True)
    joblib.dump(rf_model, os.path.join(MODEL_DIR, "crop_recommendation_rf.pkl"))
    
    # Generate Graphs
    print("Generating Accuracy & Analysis Graphs...")
    
    # 1. Feature Importance Graph
    importances = rf_model.feature_importances_
    features = X.columns
    indices = np.argsort(importances)
    
    plt.figure(figsize=(10, 6))
    plt.title('Feature Importances for Crop Recommendation', fontsize=16)
    plt.barh(range(len(indices)), importances[indices], color='b', align='center')
    plt.yticks(range(len(indices)), [features[i] for i in indices])
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    plt.savefig(os.path.join(GRAPH_DIR, 'crop_feature_importance.png'))
    plt.close()

    # 2. Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(14, 12))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Greens', xticklabels=rf_model.classes_, yticklabels=rf_model.classes_)
    plt.title('Confusion Matrix: Crop Prediction', fontsize=18)
    plt.ylabel('Actual Label')
    plt.xlabel('Predicted Label')
    plt.xticks(rotation=90)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAPH_DIR, 'crop_confusion_matrix.png'))
    plt.close()

    print(f"Graphs saved to {GRAPH_DIR}")

if __name__ == "__main__":
    train_and_plot()
