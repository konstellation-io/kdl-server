const casual = require('casual');

casual.define('html', function() {
  let htmlStr = "<p><b>" + casual.sentences(1) + "</b></p>"
  htmlStr += "<ul><li>TensorFlow 2.8.0</li>"
  htmlStr += "<li>SpaCy 3.2</li>"
  htmlStr += "<li>NLTK 3.7</li></ul>"
  htmlStr += casual.sentences(10);
  return htmlStr;
});

function buildRuntime(_) {
  return {
    id: casual.uuid,
    name: casual.name,
    desc: casual.html,
    labels: casual.array_of_words(n = 7),
    dockerImage: casual.url,
    dockerTag: casual.numerify("#.##"),
    runtimePod: casual.url,
  };
}

module.exports = buildRuntime;
