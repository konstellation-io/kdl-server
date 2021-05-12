"""
This script demonstrates the usage of sklearn within KDL using a simple wine-classification challenge
"""
import os

from matplotlib import pyplot as plt
import mlflow
import pandas as pd
import seaborn as sns
from sklearn.datasets import load_wine
from sklearn.ensemble import AdaBoostClassifier, GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC


MLFLOW_URL = os.getenv("MLFLOW_URL")
MLFLOW_EXPERIMENT = os.getenv("MLFLOW_EXPERIMENT")
MLFLOW_RUN_NAME = "sklearn_example"


if __name__ == "__main__":

    mlflow.set_tracking_uri(MLFLOW_URL)
    mlflow.set_experiment(MLFLOW_EXPERIMENT)
    
    with mlflow.start_run(run_name=MLFLOW_RUN_NAME):

        # Load dataset
        X, y = load_wine(return_X_y=True, as_frame=True)
        
        # Split into training/validation data and a final test dataset
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, shuffle=True, random_state=42)
        
        # Define a number of classifiers
        models = {
            "Logistic regression": LogisticRegression(),
            "Naive Bayes": GaussianNB(),
            "K-nearest neighbour": KNeighborsClassifier(),
            "Random forest": RandomForestClassifier(),
            "SVM": SVC(kernel="linear"),
            "GradientBoost": GradientBoostingClassifier(),
            "AdaBoost": AdaBoostClassifier(),
        }
        
        # Iterate fitting and cross-validation through all model types, logging results to MLflow:
        for model_name, model in models.items():
            with mlflow.start_run(run_name=model_name, nested=True):
                kfold = KFold(n_splits=5, shuffle=True, random_state=42)
                accuracy_for_k = cross_val_score(model, X=X, y=y, cv=kfold, scoring="accuracy")
                accuracy_mean = accuracy_for_k.mean()
                
                mlflow.log_param("classifier", model_name)
                mlflow.log_metric("validation_accuracy", accuracy_mean)
