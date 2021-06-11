"""
ML pipeline for breast cancer classification
Part 3: Training NN models in PyTroch
"""

import configparser
import os

import mlflow

from processes.train_dnn_pytorch.densenet import train_densenet

PATH_CONFIG = os.getenv("PATH_CONFIG")
config = configparser.ConfigParser()
config.read(str(PATH_CONFIG))

MLFLOW_URL = os.getenv("MLFLOW_URL")
MLFLOW_TAGS = {"git_tag": os.getenv("DRONE_TAG")}


if __name__ == "__main__":

    train_densenet(
        mlflow=mlflow, config=config, mlflow_url=MLFLOW_URL, mlflow_tags=MLFLOW_TAGS
    )
