class DescriptionEvaluator(object):

    def __init__(self):
        pass

    @staticmethod
    def get_description_quality(description: str) -> float:

        if not isinstance(description, str):
            raise ValueError("`get_description_quality` expected a string input.")

        n_words = len(description.split())

        if n_words < 10:
            return 0
        if n_words > 512:
            return 1
        return n_words / 512


