import os

import pytest
from tools.config import get_environ


class TestConfigTools:

    def test_get_environ(self):
        os.environ['TEST'] = 'test_value'
        result = get_environ('TEST', mandatory=True)

        assert result == 'test_value'
        del os.environ['TEST']

    def test_get_environ_mandatory(self):
        with pytest.raises(Exception):
            get_environ('TEST', mandatory=True)

    def test_default(self):
        result = get_environ('TEST', default='test_default')
        assert result == 'test_default'
