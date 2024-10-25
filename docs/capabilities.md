# Capabilities

Capabilities feature allows to select the rules to be matched by the Kubernetes scheduler when deploying the userTools on a pod.

There are multiple scenarios for the capabilities based on the configuration stored on the MongoDB database:

1. There are no capabilities stored

- In the case where there are no capabilities stored on the database, the behavior would be the same as it is now, the Kubernetes scheduler will select the node where the userTools will be deployed.
- The UI won't show the capabilities selector

2. There is just one capability stored

- In case there is just one capability on the database, the stored capability will be selected by default, and the contained rules of the capability will determine the node where the userTools would be deployed.
- No selector will be shown on the UI.

3. There are two or more capabilities stored

- When there are two or more capabilities stored, the capabilities will be sorted by the `default` field, and the first capability from the list will be selected as the default capability.
- The UI will show a selector with all the capabilities to allow the user to choose between them.

The capabilities object contains three different ways of configuring the rules for deploying the userTools, allowing to do multiple combinations of different rule sets.

1. NodeSelectors

- A list of key-pair objects like in the example below:

    ```json
    {
      "_id": "test_id",
      "name": "test",
      "node_selectors": {
        "selector1": "value1",
        "selector2": "value2"
      },
      "tolerations": [],
      "affinities": {}
    }
    ```

2. Tolerations

- Unlike NodeSelectors, tolerations allow adding more complex rules.
- It consists of a list of `key`<`operator`>`value`:`effect` rule set like in the example below:

    ```json
    {
      "_id": "test_id",
      "name": "test",
      "node_selectors": {},
      "tolerations": [
        {
          "key": "key1",
          "operator": "Equal",
          "value": "value1",
          "effect": "NoExecute",
          "tolerationSeconds": 120
        }
      ],
      "affinities": {}
    }
    ```

3. Affinities

- Still in development...

    ```json
    {
      "_id": "test_id",
      "name": "test",
      "node_selectors": {},
      "tolerations": [],
      "affinities": {}
    }
    ```

## Adding capabilites to the MongoDB

To add capabilites to the mongodb, you should follow the next steps:

- Add port-forwardding from the mongodb pod

  ```bash
  kubectl port-forward mongo-.... 27017:27017
  ```

- Connect to the mongodb instance

  ```bash
  mongosh --port 27017 --username <username> --authenticationDatabase admin --password <password>
  ```

- Use the `KDL` database, and the `capabilities` collection

  ```bash
  use KDL
  ```

- Add the needed capabilites

  ```bash
  db.capabilities.insertMany([
    {
      "_id": "test_id1",
      "name": "test 1",
      "node_selectors": {
        "selector1": "value1",
        "selector2": "value2"
      },
      "tolerations": [],
      "affinities": {}
    },
    {
      "_id": "test_id2",
      "name": "test 2",
      "node_selectors": {},
      "tolerations": [
        {
          "key": "key1",
          "operator": "Equal",
          "value": "value1",
          "effect": "NoExecute",
          "tolerationSeconds": 120
        }
      ],
      "affinities": {}
    }
  ])
  ```
