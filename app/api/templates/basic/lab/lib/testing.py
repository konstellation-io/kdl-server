"""
Reusable functions for testing
"""

from mock import MagicMock


def get_mlflow_stub() -> MagicMock:
    """
    Creates a stub/mock object to replace mlflow in local executions and during testing.

    When injected in place of the mlflow module, it provides dummies for the following calls:
    - mlflow.set_tracking_uri
    - mlflow.set_experiment
    - mlflow.start_run (as context manager)
    - mlflow.log_param
    - mlflow.log_params
    - mlflow.log_metric
    - mlflow.log_metrics
    - mlflow.log_artifacts

    Returns:
        [MagicMock] -- a stub that can be used in place of mlflow in local and test executions
    """
    mlflow_stub = MagicMock()
    mlflow_stub.set_tracking_uri.return_value = None
    mlflow_stub.set_experiment.return_value = None
    mlflow_stub.start_run.__enter__.return_value = None
    mlflow_stub.log_artifacts.return_value = None
    mlflow_stub.log_param.return_value = None
    mlflow_stub.log_params.return_value = None
    mlflow_stub.log_metric.return_value = None
    mlflow_stub.log_metrics.return_value = None

    return mlflow_stub
