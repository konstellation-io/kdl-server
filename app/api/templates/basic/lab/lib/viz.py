"""
Utility functions for vizualizing the results of ML model training and validation,
including confusion matrices and training curves.
"""

import itertools
from pathlib import Path
from typing import Union

from matplotlib import pyplot as plt
from matplotlib.colors import Colormap
from matplotlib.ticker import MaxNLocator
import numpy as np
import pandas as pd


def plot_training_history(
    history: pd.DataFrame,
    show: bool = True,
    title: str = '',
    savepath: Union[None, str, Path] = None,
    accuracy_metric: str = 'acc'
        ) -> None:
    """
    Plots training history (validation and loss) for a model, given a table of metrics per epoch.

    Args:
        history: (pd.DataFrame) a data frame containing data for each epoch for accuracy for the following quantities:
            - 'acc': training accuracy,
            - 'loss':  training loss,
            - 'val_acc': validation accuracy,
            - 'val_loss': validation loss
            - 'epoch': epoch number
        show: (bool) show plot if True
        title: (str) Title of the plot
        savepath: (str or Path, or None) file path to save resulting plot. If None, omit saving
        accuracy_metric: (str) name of the accuracy metric in the input model history, if different from 'acc'

    Returns:
        (None or tuple of (fig, axes))
    """
    epochs = history['epoch']
    loss = history['loss']
    val_loss = history['val_loss']

    acc = history[accuracy_metric]
    val_acc = history[f"val_{accuracy_metric}"]

    assert len(acc) == len(val_acc) == len(loss) == len(
        val_loss), "All metrics should have the same number of measurements (one for each epoch)."

    fig, ax = plt.subplots(1, 1)

    ax.plot(epochs, acc, c='r', lw=1, label='Train accuracy')
    ax.plot(epochs, val_acc, c='r', lw=2, label='Validation accuracy')
    ax.hlines(y=1, xmin=ax.get_xlim()[0], xmax=ax.get_xlim()[1], color="k", lw=1, ls="--", alpha=0.3)
    ax.set_xlabel('Epoch')

    xticks = MaxNLocator(nbins=11, steps=[1, 2, 5, 10])
    ax.xaxis.set_major_locator(xticks)

    ax.set_ylabel('Accuracy', color='r')
    ax.tick_params(axis='y', labelcolor='r')

    ax2 = ax.twinx()
    ax2.plot(epochs, loss, c='b', lw=1, label='Train loss')
    ax2.plot(epochs, val_loss, c='b', lw=2, label='Validation loss')
    ax2.set_ylim(0, 1.05 * max(max(loss), max(val_loss)))
    ax2.set_ylabel('Loss', color='b')
    ax2.tick_params(axis='y', labelcolor='b')

    # Make space for legend above
    ax.set_ylim(min(0.5, ax.get_ylim()[0]), 1.1*ax.get_ylim()[1])
    ax2.set_ylim(ax2.get_ylim()[0], 1.2*ax2.get_ylim()[1])

    # Hide ticks on accuracy axis above 1.0
    yticks = ax.yaxis.get_major_ticks()
    yticks[-1].set_visible(False)
    yticks[-2].set_visible(False)

    ax.legend(loc=2, frameon=False)
    ax2.legend(loc=1, frameon=False)
    plt.title(title)

    if savepath:
        plt.savefig(savepath)

    if show:
        plt.show()

    plt.close()


def plot_confusion_matrix(
    cm: np.ndarray,
    normalize: bool = True,
    title: str = 'Confusion matrix',
    cmap: Colormap = plt.cm.Blues,
    show: bool = True,
    class_names: Union[None, list] = None,
    savepath: Union[None, str, Path] = None
        ) -> None:
    """
    Prints and plots the confusion matrix.

    Args:
        cm: (np.array) of shape (2, 2) containing elements of the confusion matrix (order: tn, fp, fn, tp)
        normalize: (bool) Normalization can be applied by setting normalize = True
        title: (string) plot title
        cmap: (pyplot colormap)
        show: (bool) display resulting plot
        savepath: (str) destination to save results on disk
    """
    assert cm.shape[0] == cm.shape[1], "Confusion matrix not square!"

    if normalize:
        cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]

    vmax = 1 if normalize else np.sum(cm, axis=1).max()

    fig, ax = plt.subplots(figsize=(6, 6))

    ax.imshow(cm, interpolation='nearest', cmap=cmap, vmin=0, vmax=vmax)
    ax.set_title(title)
    tick_marks = np.arange(cm.shape[0])
    if not class_names:
        class_names = tick_marks

    ax.set_xticks(ticks=tick_marks)
    ax.set_xticklabels(class_names, rotation=0)
    ax.set_yticks(ticks=tick_marks)
    ax.set_yticklabels(class_names, rotation=0)

    fmt = '.2f' if normalize else 'd'
    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, format(cm[i, j], fmt),
                 horizontalalignment="center",
                 color="white" if cm[i, j] > thresh else "black")

    plt.ylabel('True label')
    plt.xlabel('Predicted label')
    plt.tight_layout()

    if savepath:
        fig.savefig(savepath)
        print(f"Saved confusion matrix plot to {savepath}")
    if show:
        plt.show()
