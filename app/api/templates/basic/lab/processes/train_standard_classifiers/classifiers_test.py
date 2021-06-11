"""
Integration test for train_standard_classifiers
"""

import configparser
import os
from pathlib import Path

import pytest

from lib.testing import get_mlflow_stub
from processes.train_standard_classifiers.classifiers import train_classifiers

vscode_config = configparser.ConfigParser()
vscode_config.read("lab/processes/config_test.ini")


@pytest.mark.integration
def test_train_classifiers_runs_without_errors(temp_data_dir):
    """
    Runs train_classifiers with a mock mlflow instance. Verifies that:
    - train_classifiers runs without any errors
    - artifacts are created in the temporary artifacts directory (provided with config)
    - the mlflow provided to the function is called to log the metrics, params and artifacts

    Uses test fixture temp_data_dir to create a temporary dataset required by train_classifiers (see conftest.py)
    """
    vscode_config["paths"]["dir_processed"] = temp_data_dir

    mlflow_stub = get_mlflow_stub()

    train_classifiers(
        mlflow=mlflow_stub,
        config=vscode_config,
        mlflow_url=None,
        mlflow_tags=None,
    )

    # Verify that the resulting files have been created in the temporary artifacts directory:
    dir_artifacts = vscode_config["paths"]["artifacts_temp"]
    filename_conf_matrix = vscode_config["filenames"]["fname_conf_mat"]
    assert filename_conf_matrix in os.listdir(dir_artifacts)

    # Check that mlflow has been called to log artifacts, metrics, and params
    mlflow_stub.start_run.assert_called()
    mlflow_stub.log_artifacts.assert_called_with(Path(dir_artifacts))
    mlflow_stub.log_params.assert_called()
    mlflow_stub.log_metrics.assert_called()
