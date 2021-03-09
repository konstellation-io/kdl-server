class KnowledgeGraphException(Exception):
    pass


class AssetLoadingException(KnowledgeGraphException):
    pass


class MissingFieldException(KnowledgeGraphException):
    pass


class MissingEnvVarException(KnowledgeGraphException):
    pass
