import os
from logging.config import dictConfig
from pathlib import Path


def get_environ(variable: str, mandatory: bool = False, default: str = None) -> str:
    """
    Gets environment checks for mandatory variables and default values.
    """
    env_variable = os.environ.get(variable)

    if mandatory and env_variable is None:
        raise Exception(f"Environment variable {variable} not found")
    elif env_variable is None and default is not None:
        return default
    elif env_variable is not None:
        return env_variable
    else:
        return ""


# Asset settings
ASSET_ROUTE = get_environ('KG_ASSET_ROUTE', mandatory=True)

# Server Settings
WORKERS = int(get_environ('KG_WORKERS', default="1"))
HOST = get_environ('KG_HOST', default="localhost")
PORT = int(get_environ('KG_PORT', default="5555"))

# Recommender Settings
N_HITS = int(get_environ('N_HITS', default="10"))

# Logger Settings
LOG_FILE = Path(get_environ('KG_LOG_FILE', default="/var/log/kg.log"))
LOG_LEVEL = get_environ('KG_LOG_LEVEL', default="INFO")

LOG_CONFIG = {
    'version': 1,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level': LOG_LEVEL,
            'formatter': 'standard',
            'class': 'logging.StreamHandler',
        },
        'file': {
            'level': LOG_LEVEL,
            'formatter': 'standard',
            'class': 'logging.FileHandler',
            'filename': LOG_FILE
        },
    },
    'loggers': {
        '': {
            'handlers': ['default', 'file'],
            'propagate': False
        },
    }
}

dictConfig(LOG_CONFIG)
