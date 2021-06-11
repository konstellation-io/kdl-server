from pathlib import Path
from typing import Union

import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from lib.utils import flatten_list


def create_dataloader(
    X: torch.Tensor, y: torch.Tensor, dataloader_args: dict
) -> DataLoader:
    """
    Converts input torch tensors X and y into a DataLoader object.

    Args:
        X: (torch Tensor) a tensor containing input features
        y: (torch Tensor) a tensor containing labels
        dataloader_args: (dict) keyword arguments for torch DataLoader
            (e.g. batch_size: int, num_workers: int, shuffle: bool)

    Returns:
        (torch DataLoader)
    """
    dataset = TensorDataset(X, y)
    dataloader = DataLoader(dataset, **dataloader_args)
    return dataloader


def train_loop(
    dataloader: DataLoader,
    model: nn.Module,
    loss_fn: nn.modules.loss._Loss,
    optimizer: torch.optim.Optimizer,
) -> tuple:
    """
    Training loop through the dataset for a single epoch of training.
    Side effect: modifies input objects (model, loss_fn and optimizer) without returning.

    Args:
        dataloader: (Dataloader) a torch DataLoader containing training samples (X) and labels (y)
        model: (nn.Module) a torch neural network object to train
        loss_fn: (torch.nn.modules.loss._Loss) a torch loss function object
        optimizer: (torch.optim.Optimizer) torch optimizer object, e.g. Adam or SGD

    Returns:
        (tuple):
            (float) train_loss: the value of loss function on all training data provided with the dataloader
            (float) correct: training set accuracy
    """
    size = len(dataloader.dataset)
    model.train()

    train_loss, correct = 0, 0

    for X, y in dataloader:
        y = y.unsqueeze(1)

        # Compute prediction and loss
        probs = model(X)
        loss = loss_fn(probs, y)
        train_loss += loss.item()

        preds = probs > 0.5
        correct += (preds == y).sum().item()

        # Backpropagation
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    train_loss /= size
    correct /= size

    return train_loss, correct


def val_loop(
    dataloader: DataLoader, model: nn.Module, loss_fn: nn.modules.loss._Loss
) -> tuple:
    """
    Validation loop through the dataset.

    Args:
        dataloader: (Dataloader) a torch DataLoader containing validation samples (X) and labels (y)
        model: (nn.Module) a torch neural network object to validate
        loss_fn: (torch.nn.modules.loss._Loss) a torch loss function object to compute validation loss

    Returns:
        (tuple):
            (float) val_loss: the value of loss function on all validation data provided with the dataloader
            (float) correct: validation set accuracy
            (tuple[list]): (y_true, y_pred): lists containing true labels and the labels as predicted by the model
    """
    size = len(dataloader.dataset)
    model.eval()

    y_true = []
    y_pred = []
    val_loss, correct = 0, 0

    with torch.no_grad():
        for X, y in dataloader:
            y = y.unsqueeze(1)
            y_proba = model(X)
            val_loss += loss_fn(y_proba, y).item()

            y_preds_batch = (y_proba > 0.5).double()
            correct += (y_preds_batch == y).sum().item()

            y_pred.append(y_preds_batch.tolist())
            y_true.append(y.tolist())

    val_loss /= size
    correct /= size

    y_pred = flatten_list(y_pred)
    y_true = flatten_list(y_true)

    return val_loss, correct, (y_true, y_pred)


def train_and_validate(
    model: nn.Module,
    loss_fn: nn.modules.loss._Loss,
    optimizer: torch.optim.Optimizer,
    train_loader: DataLoader,
    val_loader: DataLoader,
    epochs: int,
    filepath_model: Union[str, Path],
) -> tuple:
    """
    Runs model training and validation using the dataloaders provided for the number of epochs specified,
    saving the best version of the model to specified location.

    Args:
        model: (torch.nn.Module) torch model object to train and validate
        loss_fn: (torch.nn.modules.loss._Loss) torch loss function object to use in training and validation
        optimizer: (torch.optim.Optimizer) torch optimizer object to use in training
        train_loader: (DataLoader) the dataloader containing training data
        val_loader: (DataLoader) the dataloader containing validation data
        epochs: (int) the number of epochs
        filepath_model: (str or Path) the location at which to save the best model

    Returns:
        (tuple):
            (torch.nn.Module): trained model
            (pandas DataFrame): training history metrics
            (tuple[list]): (y_true, y_pred): lists containing true labels and the labels as predicted by
                the model for the validation set in last iteration
    """
    df_history = pd.DataFrame(
        [], columns=["epoch", "loss", "val_loss", "acc", "val_acc"]
    )

    best_acc = 0

    # Loop through epochs
    for epoch in range(1, epochs + 1):
        print(f"Epoch {epoch}\n-------------------------------")

        train_loss, train_acc = train_loop(
            dataloader=train_loader, model=model, loss_fn=loss_fn, optimizer=optimizer
        )
        print(
            f"Training set: Accuracy: {(100*train_acc):>0.1f}%, Avg loss: {train_loss:>7f}"
        )

        val_loss, val_acc, (y_true, y_pred) = val_loop(
            dataloader=val_loader, model=model, loss_fn=loss_fn
        )
        print(
            f"Validation set: Accuracy: {(100*val_acc):>0.1f}%, Avg loss: {val_loss:>7f} \n"
        )

        df_history = df_history.append(
            dict(
                epoch=epoch,
                loss=train_loss,
                val_loss=val_loss,
                acc=train_acc,
                val_acc=val_acc,
            ),
            ignore_index=True,
        )

        if val_acc > best_acc:
            torch.save(model.state_dict(), filepath_model)
            best_acc = val_acc

    return model, df_history, (y_true, y_pred)
