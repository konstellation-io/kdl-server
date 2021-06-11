"""
Configuration for pytest unit tests
"""

import pytest
import shutil

from processes.prepare_data.cancer_data import prepare_cancer_data


@pytest.fixture(name="temp_data_dir", scope="module")
def temporary_cancer_data_directory(dir_temp="temp"):
    """
    Pytest fixture for those tests that require a data directory containing the cancer dataset arrays.
    As part of setup, the fixture creates those arrays in the temporary location specified by dir_temp

    Keyword Arguments:
        dir_temp {str} -- Path where the files will be temporarily generated; the directory is cleared up after
            running the test (default: {"temp"})
    """

    # Setup:
    prepare_cancer_data(dir_output=dir_temp)

    yield dir_temp

    # Teardown:
    shutil.rmtree(dir_temp)
