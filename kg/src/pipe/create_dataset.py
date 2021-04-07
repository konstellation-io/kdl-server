"""
This creates and tests the dataset for production enviroment.
"""
import hashlib
import string
from typing import Union

import numpy as np
import pandas as pd
from pipe.data_checks import dataset

BASE_DIR = "inputs/"

INPUT_ARXIV = BASE_DIR + "arxiv-metadata-oai-snapshot.json"

INPUT_PWC = BASE_DIR + "papers-with-abstracts.json"
INPUT_EXTRA_PWC = BASE_DIR + "links-between-papers-and-code.json"

OUTPUT_FILEPATH = "assets/"

CATEGORY_FILTER = "cs."


def create_id(title: str, abstract: str, authors: [str], date: str, url: str) -> str:
    """
    Creates an id for each paper using a hash of titles, authors, abstracts date and urls.
    Returns:
        returns a md5 with all the inputs.
    """
    authors_str = ",".join(authors)
    composed = title + abstract + authors_str + date + url
    composed = composed.translate({ord(c): None for c in string.whitespace})
    h = hashlib.md5()
    h.update(composed.encode('utf-8'))

    return h.hexdigest()


def get_df_arxiv_json(input_path: str, category: str, chunk_size: int = 10 ** 5) -> pd.DataFrame:
    """
    Gets base json and returns a filtered by category Dataframe
    Args:
        input_path: path of base json of arxiv.
        category: string with category to filter.
        chunk_size: size of chunk read.
    Returns:
        pandas DataFrame with filtered category only
    """

    def get_first_version_date(versions: list) -> str:
        """
        Gets the date of the first version of the paper
        Args:
            versions: list of all paper versions

        Returns:
            date: string with date of last input
        """
        for version in versions:
            if version['version'] == 'v1':
                return pd.to_datetime(version['created']).strftime('%Y-%m-%d')
        else:
            raise Exception('No first version date found')

    def author_list_to_string(author_list: list) -> list[str]:
        """
        Transforms parsed authors into a list of strings
        Args:
            author_list: a list of authors list.

        Returns:
            author_strings: a list of author strings.

        """
        author_strings = list()
        for author in author_list:
            author_strings.append(" ".join(author).rstrip())

        return author_strings

    df = pd.DataFrame(columns=["id", "date", "authors", "title", "abstract"])
    with pd.read_json(input_path, lines=True,
                      convert_dates=False, chunksize=chunk_size,
                      dtype={"id": str}) as reader:
        for chunk in reader:
            # Filter category
            chunk = chunk[chunk.categories.apply(lambda x: category in x)]

            chunk['date'] = chunk.versions.apply(get_first_version_date)
            chunk['authors'] = chunk.authors_parsed.apply(author_list_to_string)

            df = df.append(chunk[['id', 'date', 'authors', 'title', 'abstract']])

    return df


def get_arxiv_df(input_path: str, category_filter: str) -> pd.DataFrame:
    """
    Generates arxiv part of prod dataset from initial dataframe and extra json info.
    Args:
        input_path: path of the input csv
        category_filter: category to filter

    Returns:
        dataframe with the necessary columns for prod

    """

    def create_arxiv_url(arxiv_id: str) -> str:
        return f"https://arxiv.org/abs/{arxiv_id}"

    # Load dataframes
    df = get_df_arxiv_json(input_path, category=category_filter)

    # Rename ids to external_id
    df = df.rename(columns={"id": "external_id"})

    # create url for dataset
    df['url'] = df.external_id.apply(create_arxiv_url)
    # Generating a ID for each paper
    df['id'] = np.vectorize(create_id)(df['title'], df['abstract'], df['authors'], df['date'], df['url'])

    return df


def get_pwc_df(input_path: str, extra_path: str) -> (pd.DataFrame, pd.DataFrame):
    """
    A function that gets an input path and extra path and creates
    a new papers with code standard dataframe for prod.
    Args:
        input_path: location of main json with papers with code data.
        extra_path: location of the extra data.

    Returns:
        Two dataframes one with pwc with arxiv ids and one without.

    """

    def categorize_pwc(repo: Union[list, float]) -> str:
        """
        A function to assign the code or paper category
        Args:
            repo: A list of repo urls or NaN.

        Returns:
            category: a string with the category it belongs.

        """
        if repo is not np.NAN and ("http" in repo[0].lower()):
            return "Code"
        else:
            return "Paper"

    df = pd.read_json(input_path, dtype={"paper_arxiv_id": str})
    df_extra = pd.read_json(extra_path)

    df['date'] = df['date'].dt.strftime('%Y-%m-%d')

    # clean papers without abstract or title
    df = df[df.abstract.notna() & df.title.notna()]

    frameworks = df_extra[df_extra.framework != "none"] \
        .groupby('paper_url')['framework'] \
        .apply(set).apply(list)
    repo_urls = df_extra.groupby('paper_url')['repo_url'].apply(list)

    df = pd.merge(df, frameworks.rename('frameworks'), left_on="paper_url", right_index=True, how="left")
    df = pd.merge(df, repo_urls.rename('repo_urls'), left_on="paper_url", right_index=True, how="left")

    df['category'] = df.repo_urls.apply(categorize_pwc)
    df.rename(columns={"arxiv_id": "external_id", "paper_url": "url"}, inplace=True)
    df['id'] = np.vectorize(create_id)(df['title'], df['abstract'], df['authors'], df['date'], df['url'])
    filter_columns = ['id', 'title', 'abstract',
                      'authors', 'category',
                      'external_id', 'url',
                      'date', 'repo_urls', 'frameworks']

    return df[df.external_id.isna()][filter_columns], df[df.external_id.notna()][filter_columns]


def create_prod_dataset(arxiv_dataset: str, category_filter: str,
                        pwc_papers: str, pwc_links: str) -> pd.DataFrame:
    """
    Creates the prod version of the dataset merging all the
    data from different sources.
    """
    df_arxiv = get_arxiv_df(arxiv_dataset, category_filter)
    df_pwc, df_pwc_arxiv = get_pwc_df(pwc_papers, pwc_links)

    # Merge papers with code with arxiv ids into arxiv dataset.
    df_arxiv = pd.merge(df_arxiv, df_pwc_arxiv[['external_id',
                                                'repo_urls',
                                                'category',
                                                'frameworks']],
                        how="left",
                        on="external_id")

    df_arxiv.category.fillna('Paper', inplace=True)

    df = pd.concat([df_arxiv, df_pwc])

    # Take care of null values and put correct types
    df.frameworks = df.frameworks.apply(lambda x: [] if type(x) is not list else x)
    df.repo_urls = df.repo_urls.apply(lambda x: [] if type(x) is not list else x)
    df.external_id = df.external_id.apply(lambda x: "" if not x else x)

    return df


if __name__ == "__main__":
    print("Starting dataset creation")
    df_final = create_prod_dataset(INPUT_ARXIV, CATEGORY_FILTER,
                                   INPUT_PWC, INPUT_EXTRA_PWC)

    # Check format
    dataset.check_df_columns(df_final)
    dataset.check_categories(df_final)

    # Check no na
    dataset.check_no_nan(df_final.repo_urls)
    dataset.check_no_nan(df_final.frameworks)
    dataset.check_no_nan(df_final.external_id)

    # Check types
    dataset.check_type(df_final.repo_urls, list)
    dataset.check_type(df_final.frameworks, list)
    dataset.check_type(df_final.category, str)
    dataset.check_type(df_final.date, str)
    dataset.check_type(df_final.external_id, str)

    df_final.to_pickle(OUTPUT_FILEPATH + 'dataset.pkl.gz',
                       compression="gzip",
                       protocol=5)

    print("All datasets created")
