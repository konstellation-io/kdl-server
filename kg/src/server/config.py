from logging.config import dictConfig
from pathlib import Path

from tools.config import get_environ

# Asset settings
ASSET_ROUTE = get_environ("KG_ASSET_ROUTE", mandatory=True)

# Server Settings
WORKERS = int(get_environ("KG_WORKERS", default="1"))
HOST = get_environ("KG_HOST", default="localhost")
PORT = int(get_environ("KG_PORT", default="5555"))

# Recommender Settings
N_HITS = int(get_environ("N_HITS", default="1000"))

# Description Quality Settings
MIN_WORDS = int(get_environ("MIN_WORDS", default="10"))

# Logger Settings
LOG_FILE = Path(get_environ("KG_LOG_FILE", default="/var/log/kg.log"))
LOG_LEVEL = get_environ("KG_LOG_LEVEL", default="INFO")

LOG_CONFIG = {
    "version": 1,
    "formatters": {
        "standard": {"format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"},
    },
    "handlers": {
        "default": {
            "level": LOG_LEVEL,
            "formatter": "standard",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
        "file": {
            "level": LOG_LEVEL,
            "formatter": "standard",
            "class": "logging.FileHandler",
            "filename": LOG_FILE,
        },
    },
    "loggers": {
        "": {"handlers": ["default", "file"], "level": LOG_LEVEL, "propagate": False},
    },
}

dictConfig(LOG_CONFIG)
