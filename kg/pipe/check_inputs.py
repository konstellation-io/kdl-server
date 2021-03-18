import pandas as pd

BASE_DIR = "inputs/"

INPUT_ARXIV = BASE_DIR + "arxiv-metadata-oai-snapshot.json"

INPUT_PWC = BASE_DIR + "papers-with-abstracts.json"
INPUT_EXTRA_PWC = BASE_DIR + "links-between-papers-and-code.json"


class MissingColsException(Exception):
    pass


class WrongValueInColumn(Exception):
    pass


class CheckPwCInputs:
    """
    Class that checks that all the input pwc files contain all the necessary
    elements to create the prod datasets.
    """

    def __init__(self, input_path: str, links_path: str):
        self.papers = pd.read_json(input_path, dtype={"paper_arxiv_id": str})
        self.links = pd.read_json(links_path)

    def check_papers_cols(self):
        mandatory_cols = {"paper_url", "date", "title", "abstract", "authors"}
        columns = set(self.papers.columns)
        try:
            assert mandatory_cols.issubset(columns)
        except AssertionError:
            missing_cols = mandatory_cols.difference(columns)
            raise MissingColsException(f"Missing cols in PWC: {missing_cols}")

    def check_links_cols(self):
        mandatory_cols = {"paper_url", "framework", "repo_url", "paper_arxiv_id", "paper_arxiv_id", }
        columns = set(self.links.columns)
        try:
            assert mandatory_cols.issubset(columns)
        except AssertionError:
            missing_cols = mandatory_cols.difference(columns)
            raise MissingColsException(f"Missing cols in PwC Links: {missing_cols}")

    def check_all_repos_urls(self):
        try:
            assert all("http" in url for url in self.links.repo_url.unique())
        except AssertionError:
            raise WrongValueInColumn("Not all repo_url have schema")

    def check_frameworks_nones(self):
        try:
            assert any("none" == fw for fw in self.links.framework.unique())
        except AssertionError:
            raise WrongValueInColumn("Not any framework with value \"none\" check framework column")

    def run(self):
        self.check_papers_cols()
        self.check_links_cols()
        self.check_all_repos_urls()
        self.check_frameworks_nones()


class CheckArxivInputs:

    def __init__(self, input_path: str, sample: int = 10):
        self.base = pd.read_json(input_path, lines=True,
                                 convert_dates=False, dtype={"id": str}, nrows=sample)

    def check_cols(self):
        mandatory_cols = {"id", "authors_parsed", "title", "abstract", "versions", "categories"}
        cols = set(self.base.columns)
        try:
            assert mandatory_cols.issubset(cols)
        except AssertionError:
            missing_cols = mandatory_cols.difference(cols)
            raise MissingColsException(f"Missing cols in Arxiv: {missing_cols}")

    def run(self):
        self.check_cols()


if __name__ == "__main__":
    print("Running input checks\n")
    pwc_checks = CheckPwCInputs(INPUT_PWC, INPUT_EXTRA_PWC)
    pwc_checks.run()
    del pwc_checks
    arxiv_checks = CheckArxivInputs(INPUT_ARXIV)
    arxiv_checks.run()
    del arxiv_checks
    print("All input checks passed :)\n")
