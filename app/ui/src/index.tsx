import 'kwc/index.css';
import 'Styles/app.global.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tabs/style/react-tabs.css';
import 'Styles/react-tabs.scss';
import 'Styles/react-toastify.scss';

import App from './App';
import * as React from 'react';
import ReactDOM from 'react-dom';
import fetchConfig from './fetchConfig';

type Config = {
  SERVER_NAME: string;
  SERVER_URL: string;
  KNOWLEDGE_GALAXY_ENABLED: boolean;
  KG_SERVER_URL: string;
  RELEASE_VERSION: string;
  DESCRIPTION_MIN_WORDS: number;
};
export let CONFIG: Config;

fetchConfig.then((configJson) => {
  CONFIG = configJson;
  ReactDOM.render(<App />, document.getElementById('root'));
});
