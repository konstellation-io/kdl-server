const fetchConfig = fetch('/config.json').then((response) => {
  if (!response.ok) {
    throw new Error(
      `Unexpected status code: ${response.status} getting configuration file`
    );
  }
  return response.json();
});

export default fetchConfig;
