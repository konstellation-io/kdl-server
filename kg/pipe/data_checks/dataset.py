import pandas as pd


class DatasetColumnsException(Exception):
    pass


class DatasetCategoryException(Exception):
    pass


class DatasetNaNException(Exception):
    pass


def check_df_columns(df: pd.DataFrame):
    """
    This is a simple test to make sure that the current dataset matches the specifications
    of what we will need in prod
    Args:
        df: A pandas dataframe that has to have the same columns as specified in this tests

    Returns:
        It will return nothing or an error if the columns don't match.
    """
    mandatory_cols = {"id", "category",
                      "title", "abstract", "authors",
                      "url", "external_id",
                      "repo_urls", "frameworks", "date"}
    cols = set(df.columns)
    try:
        assert mandatory_cols == cols
    except AssertionError:
        message = ""
        missing_columns = mandatory_cols.difference(cols)
        if missing_columns:
            message = f"Missing columns: {missing_columns}\n"
        extra_columns = cols.difference(mandatory_cols)
        if extra_columns:
            message += f"Redundant columns: {extra_columns} "
        raise DatasetColumnsException(message)


def check_categories(df: pd.DataFrame):
    """
    Args:
        df: a candidate dataset for prod

    Returns:
        Nothing but raises an error if the categories are not right...
    """
    expected_cats = {"Code", "Paper"}
    cats = df['category'].unique()
    try:
        assert set(cats).issubset(expected_cats)
    except AssertionError:
        raise DatasetCategoryException("Check dataframe categories")


def check_no_nan(column: pd.Series):
    try:
        assert all(column.notna())
    except AssertionError:
        raise DatasetNaNException(f"{column.name} has NaN values")


def check_type(column: pd.Series, t: type):
    try:
        assert all(column.apply(lambda x: type(x) is t))
    except AssertionError:
        raise TypeError(f"{column.name} type  is not {t}")
