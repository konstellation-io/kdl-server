const casual = require('casual');

casual.define('html', function () {
  let htmlStr = "<p><b>" + casual.sentences(1) + "</b></p>"
  htmlStr += "<ul><li>TensorFlow 2.8.0</li>"
  htmlStr += "<li>SpaCy 3.2</li>"
  htmlStr += "<script>alert('it's safe this html?')</script/><li>NLTK 3.7</li></ul>"
  htmlStr += casual.sentences(10);
  return htmlStr;
});

function buildCapabilities(_) {
  return {
    id: casual.uuid,
    name: casual.name,
    default: casual.boolean
  };
}

module.exports = buildCapabilities;
