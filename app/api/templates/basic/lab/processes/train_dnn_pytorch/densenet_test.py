"""
Integration test for train_dnn_pytorch
"""

import configparser
import os
from pathlib import Path

import pytest

from lib.testing import get_mlflow_stub
from processes.train_dnn_pytorch.densenet import train_densenet

vscode_config = configparser.ConfigParser()
vscode_config.read("lab/processes/config_test.ini")


@pytest.mark.integration
@pytest.mark.filterwarnings("ignore:CUDA initialization")
def test_train_densenet_without_errors(temp_data_dir):
    """
    Runs train_densenet with a mock mlflow instance.

    Verifies that:
    - train_densenet runs without any errors
    - artifacts are created in the temporary artifacts directory (provided with config)
    - the mlflow provided to the function is called to log the metrics, params and artifacts

    Uses test fixture temp_data_dir to create a temporary dataset required by train_densenet (see conftest.py)
    """
    vscode_config["paths"]["dir_processed"] = temp_data_dir

    mlflow_stub = get_mlflow_stub()

    train_densenet(
        mlflow=mlflow_stub,
        config=vscode_config,
        mlflow_url=None,
        mlflow_tags=None
        )

    # Check the resulting artifact files (.csv y .png) have been created
    dir_artifacts = vscode_config["paths"]["artifacts_temp"]
    artifacts_contents = os.listdir(dir_artifacts)
    fname_model = vscode_config["filenames"]["fname_model"]
    fname_conf_matrix = vscode_config["filenames"]["fname_conf_mat"]
    fname_training_history = vscode_config["filenames"]["fname_training_history"]
    fname_training_history_csv = vscode_config["filenames"]["fname_training_history_csv"]

    for fname in [fname_model, fname_conf_matrix, fname_training_history, fname_training_history_csv]:
        assert fname in artifacts_contents

    # Assert that mlflow has been called to log artifacts, metrics, and params
    mlflow_stub.start_run.assert_called()
    mlflow_stub.log_artifacts.assert_called_with(Path(dir_artifacts))
    mlflow_stub.log_params.assert_called()
    mlflow_stub.log_metrics.assert_called()
