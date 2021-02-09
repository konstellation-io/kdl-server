import os


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
