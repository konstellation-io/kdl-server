const casual = require('casual');

function buildRepository() {
  const type = casual.random_element(['INTERNAL', 'EXTERNAL']);
  let url = casual.url;
  if (type === 'INTERNAL')
    url = `${casual.url}${casual.array_of_words(3).join('-')}`;

  return {
    type,
    url,
    error: casual.boolean,
    external: {
      username: casual.username,
    },
  };
}

module.exports = buildRepository;
