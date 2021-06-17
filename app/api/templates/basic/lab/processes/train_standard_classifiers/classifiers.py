"""
Functions for instantiating and training traditional ML classifiers
"""
from configparser import ConfigParser
from pathlib import Path
from types import ModuleType
from typing import Union

import joblib
import numpy as np
from mock import MagicMock
from sklearn.ensemble import (AdaBoostClassifier, GradientBoostingClassifier,
                              RandomForestClassifier)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC

from lib.viz import plot_confusion_matrix
from processes.prepare_data.cancer_data import load_data_splits


def create_classifiers() -> dict:
    """
    Instantiates a number of different sklearn classifiers and returns them in a dictionary.

    Returns:
        (dict of sklearn model objects)
    """

    models = {
        "Logistic regression": LogisticRegression(),
        "Naive Bayes": GaussianNB(),
        "K-nearest neighbour": KNeighborsClassifier(),
        "Random forest": RandomForestClassifier(),
        "Linear SVM": SVC(kernel="linear"),
        "GradientBoost": GradientBoostingClassifier(),
        "AdaBoost": AdaBoostClassifier(),
    }
    return models


def train_classifiers(
    mlflow: Union[ModuleType, MagicMock],
    config: Union[ConfigParser, dict],
    mlflow_url: str,
    mlflow_tags: dict,
) -> None:
    """
    Trains a number of classifiers on the data that is found in the directory specified as dir_processed in config.

    Arguments:
        mlflow {Union[ModuleType, MagicMock]} --  MLflow module or its mock replacement
        config {Union[ConfigParser, dict]} -- configuration for the training, with the required sections:
            - "training": containing "random_seed";
            - "paths": containing "artifacts_temp" and "dir_processed";
            - "mlflow": containing "mlflow_experiment"
        mlflow_url {str} -- MLflow URL (empty if replacing mlflow with a mock)
        mlflow_tags {dict} -- MLflow tags (empty if replacing mlflow with a mock)
    """
    # Unpack config:
    random_seed = int(config["training"]["random_seed"])
    dir_processed = config["paths"]["dir_processed"]
    dir_artifacts = Path(config["paths"]["artifacts_temp"])
    filepath_conf_matrix = dir_artifacts / "confusion_matrix.png"
    mlflow_experiment = config["mlflow"]["mlflow_experiment"]

    # Prepare before run
    np.random.seed(random_seed)
    dir_artifacts.mkdir(exist_ok=True)
    mlflow.set_tracking_uri(mlflow_url)
    mlflow.set_experiment(mlflow_experiment)

    with mlflow.start_run(run_name="sklearn_example_train", tags=mlflow_tags):

        # Load training and validation data
        X_train, X_val, _, y_train, y_val, _ = load_data_splits(
            dir_processed=dir_processed, as_type="array"
        )

        # Define a number of classifiers
        models = create_classifiers()

        # Iterate fitting and validation through all model types, logging results to MLflow:
        for model_name, model in models.items():

            with mlflow.start_run(run_name=model_name, nested=True, tags=mlflow_tags):

                model.fit(X_train, y_train)
                y_pred = model.predict(X_val)
                val_accuracy = accuracy_score(y_pred, y_val)
                cm = confusion_matrix(y_val, y_pred)
                plot_confusion_matrix(
                    cm,
                    normalize=False,
                    title="Confusion matrix (validation set)",
                    savepath=filepath_conf_matrix,
                )
                joblib.dump(model, Path(dir_artifacts) / "model.joblib")
                mlflow.log_artifacts(dir_artifacts)
                mlflow.log_params({"classifier": model_name})
                mlflow.log_metrics({"val_acc": val_accuracy})
