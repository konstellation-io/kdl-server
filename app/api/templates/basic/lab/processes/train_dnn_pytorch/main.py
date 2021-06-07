"""
ML pipeline for breast cancer classification
Part 3: Training NN models in PyTroch
"""

import configparser
import os
from pathlib import Path

import mlflow
import numpy as np
from sklearn.metrics import confusion_matrix
import torch
import torch.nn as nn

from lib.pytorch import val_loop, train_and_validate
from lib.viz import plot_confusion_matrix, plot_training_history
from processes.prepare_data.cancer_data import load_data_splits_as_dataloader
from processes.train_dnn_pytorch.densenet import DenseNN


PATH_CONFIG = os.getenv("PATH_CONFIG")
config = configparser.ConfigParser()
config.read(PATH_CONFIG)

MLFLOW_URL = os.getenv("MLFLOW_URL")
MLFLOW_EXPERIMENT = config["mlflow"]["mlflow_experiment"]
MLFLOW_RUN_NAME = "pytorch_example_train"
MLFLOW_TAGS = {"git_tag": os.getenv('DRONE_TAG')}

DIR_ARTIFACTS = Path(config['paths']['artifacts_temp'])  # Temporary hosting artifacts before logging to MLflow
FNAME_MODEL = config['filenames']['fname_model']
FILEPATH_MODEL = DIR_ARTIFACTS / FNAME_MODEL
FILEPATH_TRAINING_HISTORY = DIR_ARTIFACTS / "training_history.png"
FILEPATH_TRAINING_HISTORY_CSV = DIR_ARTIFACTS / "training_history.csv"
FILEPATH_CONF_MATRIX = DIR_ARTIFACTS / "confusion_matrix.png"

DIR_DATA_PROCESSED = config['paths']['dir_processed']

RANDOM_SEED = int(config['training']['random_seed'])
BATCH_SIZE = int(config['training']['batch_size'])
N_WORKERS = int(config['training']['n_workers'])
EPOCHS = int(config['training']['epochs'])
LR = float(config['training']['lr'])


def main() -> None:
    """
    The main function of the example Pytorch model training script

    - Loads and prepares breast cancer data for training (as defined in prepare_data.cancer_data)
    - Instantiates the densely connected neural network, optimizer and loss function for model training
    - Trains and validates a neural network (as defined in train_and_validate)
    - Keeps the best version of the model for final evaluation (not necessarily after final epoch)
    - Saves the model, its training and validation metrics and associated validation artifacts in MLflow
    """
    np.random.seed(RANDOM_SEED)
    torch.manual_seed(RANDOM_SEED)

    DIR_ARTIFACTS.mkdir(exist_ok=True)

    mlflow.set_tracking_uri(MLFLOW_URL)
    mlflow.set_experiment(MLFLOW_EXPERIMENT)

    with mlflow.start_run(run_name=MLFLOW_RUN_NAME, tags=MLFLOW_TAGS):

        # Load the data splits
        train_loader, val_loader, _ = load_data_splits_as_dataloader(
            dir_processed=DIR_DATA_PROCESSED, batch_size=BATCH_SIZE, n_workers=N_WORKERS)

        # Instantiate the Dense NN, loss function and optimizer
        net = DenseNN()
        loss_fn = nn.BCELoss()
        optimizer = torch.optim.Adam(net.parameters(), lr=LR)

        # Train and validate
        net, df_history, _ = train_and_validate(
            model=net, loss_fn=loss_fn, optimizer=optimizer,
            train_loader=train_loader, val_loader=val_loader,
            epochs=EPOCHS, filepath_model=FILEPATH_MODEL)

        # Load best version:
        net = DenseNN()
        net.load_state_dict(torch.load(FILEPATH_MODEL))

        # Get metrics on best model
        train_loss, train_acc, _ = val_loop(dataloader=train_loader, model=net, loss_fn=loss_fn)
        val_loss, val_acc, (y_val_true, y_val_pred) = val_loop(dataloader=val_loader, model=net, loss_fn=loss_fn)
        cm = confusion_matrix(y_val_true, y_val_pred)

        # Save artifacts
        plot_confusion_matrix(
            cm, normalize=False, title="Confusion matrix (validation set)", savepath=FILEPATH_CONF_MATRIX)
        plot_training_history(df_history, title="Training history", savepath=FILEPATH_TRAINING_HISTORY)
        df_history.to_csv(FILEPATH_TRAINING_HISTORY_CSV)

        # Log to MLflow:
        mlflow.log_artifacts(DIR_ARTIFACTS)
        mlflow.log_metrics(dict(
            val_loss=val_loss,
            val_acc=val_acc,
            train_loss=train_loss,
            train_acc=train_acc))
        mlflow.log_params(dict(
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            learning_rate=LR,
            classifier="DenseNN"))

        print("Done!")


if __name__ == "__main__":

    main()
