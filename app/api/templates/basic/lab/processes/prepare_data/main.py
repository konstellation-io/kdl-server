"""
ML pipeline for breast cancer classification
Part 1: Data preparation
"""

import configparser
import os

from processes.prepare_data.cancer_data import prepare_cancer_data

PATH_CONFIG = os.getenv("PATH_CONFIG")
config = configparser.ConfigParser()
config.read(str(PATH_CONFIG))

DIR_DATA_PROCESSED = config["paths"]["dir_processed"]


if __name__ == "__main__":

    prepare_cancer_data(dir_output=DIR_DATA_PROCESSED)
