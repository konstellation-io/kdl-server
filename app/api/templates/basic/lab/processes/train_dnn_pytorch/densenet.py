"""
A densely connected neural network for binary classification and its usage on the example dataset
"""

from configparser import ConfigParser
from pathlib import Path
from types import ModuleType
from typing import Union

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from mock import MagicMock
from sklearn.metrics import confusion_matrix

from lib.pytorch import train_and_validate, val_loop
from lib.viz import plot_confusion_matrix, plot_training_history
from processes.prepare_data.cancer_data import load_data_splits_as_dataloader


class DenseNN(nn.Module):
    """
    A fully connected neural network for binary classification, containing three densely connected layers and
    a binary output node.
    """

    def __init__(self):
        super(DenseNN, self).__init__()

        self.dense1 = nn.Linear(30, 200)
        self.bn1 = nn.BatchNorm1d(200)
        self.dense2 = nn.Linear(200, 100)
        self.bn2 = nn.BatchNorm1d(100)

        self.dense3 = nn.Linear(100, 100)
        self.bn3 = nn.BatchNorm1d(100)

        self.output_layer = nn.Linear(100, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:

        x = self.dense1(x)
        x = self.bn1(x)
        x = F.relu(x)

        x = self.dense2(x)
        x = self.bn2(x)
        x = F.relu(x)

        x = self.dense3(x)
        x = self.bn3(x)
        x = F.relu(x)

        x = self.output_layer(x)
        x = nn.Sigmoid()(x)

        return x


def train_densenet(
    mlflow: Union[ModuleType, MagicMock], config: ConfigParser, mlflow_url: str, mlflow_tags: dict
) -> None:
    """
    The main function of the example Pytorch model training script

    - Loads and prepares breast cancer data for training (as defined in prepare_data.cancer_data)
    - Instantiates the densely connected neural network, optimizer and loss function for model training
    - Trains and validates a neural network (as defined in train_and_validate)
    - Keeps the best version of the model for final evaluation (not necessarily after final epoch)
    - Saves the model, its training and validation metrics and associated validation artifacts in MLflow
    """
    # Unpack config
    mlflow_experiment = config["mlflow"]["mlflow_experiment"]
    random_seed = int(config["training"]["random_seed"])
    batch_size = int(config["training"]["batch_size"])
    n_workers = int(config["training"]["n_workers"])
    epochs = int(config["training"]["epochs"])
    learning_rate = float(config["training"]["lr"])
    dir_processed = config["paths"]["dir_processed"]
    dir_artifacts = Path(config["paths"]["artifacts_temp"])
    filepath_conf_matrix = dir_artifacts / config["filenames"]["fname_conf_mat"]
    filepath_model = dir_artifacts / config["filenames"]["fname_model"]
    filepath_training_history = (
        dir_artifacts / config["filenames"]["fname_training_history"]
    )
    filepath_training_history_csv = (
        dir_artifacts / config["filenames"]["fname_training_history_csv"]
    )

    # Prepare before run
    np.random.seed(random_seed)
    torch.manual_seed(random_seed)
    dir_artifacts.mkdir(exist_ok=True)
    mlflow.set_tracking_uri(mlflow_url)
    mlflow.set_experiment(mlflow_experiment)

    with mlflow.start_run(run_name="pytorch_example_train", tags=mlflow_tags):

        # Load the data splits
        train_loader, val_loader, _ = load_data_splits_as_dataloader(
            dir_processed=dir_processed, batch_size=batch_size, n_workers=n_workers
        )

        # Instantiate the Dense NN, loss function and optimizer
        net = DenseNN()
        loss_fn = nn.BCELoss()
        optimizer = torch.optim.Adam(net.parameters(), lr=learning_rate)

        # Train and validate
        net, df_history, _ = train_and_validate(
            model=net,
            loss_fn=loss_fn,
            optimizer=optimizer,
            train_loader=train_loader,
            val_loader=val_loader,
            epochs=epochs,
            filepath_model=filepath_model,
        )

        # Load best version
        net = DenseNN()
        net.load_state_dict(torch.load(filepath_model))

        # Get metrics on best model
        train_loss, train_acc, _ = val_loop(
            dataloader=train_loader, model=net, loss_fn=loss_fn
        )
        val_loss, val_acc, (y_val_true, y_val_pred) = val_loop(
            dataloader=val_loader, model=net, loss_fn=loss_fn
        )
        cm = confusion_matrix(y_val_true, y_val_pred)

        # Save artifacts
        plot_confusion_matrix(
            cm,
            normalize=False,
            title="Confusion matrix (validation set)",
            savepath=filepath_conf_matrix,
        )
        plot_training_history(
            df_history, title="Training history", savepath=filepath_training_history
        )
        df_history.to_csv(filepath_training_history_csv)

        # Log to MLflow
        mlflow.log_artifacts(dir_artifacts)
        mlflow.log_metrics(
            dict(
                val_loss=val_loss,
                val_acc=val_acc,
                train_loss=train_loss,
                train_acc=train_acc,
            )
        )
        mlflow.log_params(
            dict(
                epochs=epochs,
                batch_size=batch_size,
                learning_rate=learning_rate,
                classifier="DenseNN",
            )
        )

        print("Done!")
