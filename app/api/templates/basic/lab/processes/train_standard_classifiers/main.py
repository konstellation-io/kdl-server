"""
ML pipeline for breast cancer classification
Part 2: Training traditional ML models
"""

import configparser
import os

import mlflow

from processes.train_standard_classifiers.classifiers import train_classifiers

PATH_CONFIG = os.getenv("PATH_CONFIG")
config = configparser.ConfigParser()
config.read(str(PATH_CONFIG))

MLFLOW_URL = os.getenv("MLFLOW_URL")


if __name__ == "__main__":

    train_classifiers(mlflow=mlflow, config=config, mlflow_url=MLFLOW_URL)
