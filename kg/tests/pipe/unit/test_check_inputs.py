from unittest.mock import Mock

import pytest

from check_inputs import CheckPwCInputs, MissingColsException, WrongValueInColumn


class TestCheckPwCInputs:

    def test_check_links_cols_error(self):
        columns = ["test"]

        mock_check = Mock()
        mock_check.links.columns = columns

        with pytest.raises(MissingColsException):
            CheckPwCInputs.check_links_cols(mock_check)

    def test_check_papers_cols_error(self):
        columns = ["test"]

        mock_check = Mock()
        mock_check.papers.columns = columns

        with pytest.raises(MissingColsException):
            CheckPwCInputs.check_papers_cols(mock_check)

    def test_check_all_repos_urls_error(self):
        unique_repos = ["http://test.com", "test.com"]
        mock_check = Mock()
        mock_check.links.repo_url.unique.return_value = unique_repos

        with pytest.raises(WrongValueInColumn):
            CheckPwCInputs.check_all_repos_urls(mock_check)

    def test_check_frameworks_none_error(self):
        frameworks = ["test", "test2"]
        mock_check = Mock()
        mock_check.links.framework.unique.return_value = frameworks

        with pytest.raises(WrongValueInColumn):
            CheckPwCInputs.check_frameworks_nones(mock_check)
