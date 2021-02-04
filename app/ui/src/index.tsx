import 'kwc/index.css';
import 'Styles/app.global.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tabs/style/react-tabs.css';
import 'Styles/react-tabs.scss';
import 'Styles/react-toastify.scss';

import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import fetchConfig from './fetchConfig';

export let CONFIG: { [key: string]: string };

fetchConfig.then((configJson) => {
  CONFIG = configJson;
  ReactDOM.render(<App />, document.getElementById('root'));
});
