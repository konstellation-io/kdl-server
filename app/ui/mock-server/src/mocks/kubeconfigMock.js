const casual = require('casual');

function buildKubeconfig(_) {
  return `apiVersion: v1
    clusters:
    - cluster:
      certificate-authority-data: ${casual.text}
      server: ${casual.url}
    name: konstellation
    contexts:
    - context:
        cluster: konstellation
        user: coder
        namespace: kdl
      name: default
    current-context: default
    kind: Config
    preferences: {}
    users:
    - name: coder
      user:
        token: ${casual.text}
`;
}

module.exports = buildKubeconfig;
