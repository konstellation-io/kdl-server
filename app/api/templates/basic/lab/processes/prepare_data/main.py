"""
ML pipeline for breast cancer classification
Part 1: Data preparation
"""

import configparser
from pathlib import Path
import os

from processes.prepare_data.cancer_data import prepare_cancer_data


PATH_CONFIG = os.getenv("PATH_CONFIG")
config = configparser.ConfigParser()
config.read(PATH_CONFIG)

DIR_DATA_PROCESSED = config['paths']['dir_processed']


if __name__ == "__main__":

    Path(DIR_DATA_PROCESSED).mkdir(exist_ok=True)
    prepare_cancer_data(dir_output=DIR_DATA_PROCESSED)
