const casual = require('casual');

function buildRuntime(_) {
  return {
    id: casual.uuid,
    name: casual.name,
    desc: casual.words(200),
    labels: casual.array_of_words(n = 7),
    dockerImage: casual.url,
    usertoolsPod: casual.url,
  };
}

module.exports = buildRuntime;
