const casual = require('casual');

function buildRepository() {
  return {
    url: casual.url,
    error: casual.boolean,
    username: casual.username,
  };
}

module.exports = buildRepository;
