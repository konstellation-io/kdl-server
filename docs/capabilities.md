# capabilities

`capabilities` feature allows to select the rules to be matched by the Kubernetes scheduler when deploying the `userTools` on a Pod.

There are multiple scenarios for the capabilities based on the configuration stored on the MongoDB database:

## There are no capabilities stored

- In the case where there are no capabilities stored on the database, the behavior would be the same as it is now, the Kubernetes scheduler will select the node where the userTools will be deployed.
- The UI won't show the capabilities selector

## There is just one capability stored

- In case there is just one capability on the database, the stored capability will be selected by default, and the contained rules of the capability will determine the node where the userTools would be deployed.
- No selector will be shown on the UI.

## There are two or more capabilities stored

- When there are two or more capabilities stored, the capabilities will be sorted by the `default` field, and the first capability from the list will be selected as the default capability.
- The UI will show a selector with all the capabilities to allow the user to choose between them.

## Examples

The capabilities object contains three different ways of configuring the rules for deploying the `userTools`, allowing to do multiple combinations of different rule sets.

### nodeSelectors

- `nodeSelector` is the simplest recommended form of node selection constraint. You can add the `nodeSelector` field to your Pod specification and specify the node labels you want the target node to have. Kubernetes only schedules the Pod onto nodes that have each of the labels you specify.
- Reference: <https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector>

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

### Tolerations

- `Tolerations` are applied to pods. `Tolerations` allow the scheduler to schedule pods with matching `taints`. `Tolerations` allow scheduling but don't guarantee scheduling: the `scheduler` also evaluates other parameters as part of its function. `Taints` and `tolerations` work together to ensure that pods are not scheduled onto inappropriate nodes. One or more `taints` are applied to a node; this marks that the node should not accept any pods that do not tolerate the `taints`.
- Reference: <https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/>

Unlike `nodeSelectors`, `tolerations` allow adding more complex rules. It consists of a list of `key=value:effect` rule set like in the example below:

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

### Affinities

> [!NOTE]
> Still in development...

- The affinity feature consists of two types of affinity:
  - `Node affinity` functions like the nodeSelector field but is more expressive and allows you to specify soft rules.
  - `Inter-pod affinity/anti-affinity` allows you to constrain Pods against labels on other Pods.
- Ref: <https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity>

```json
{
  "_id": "test_id",
  "name": "test",
  "node_selectors": {},
  "tolerations": [],
  "affinities": {}
}
```

## How-to add `capabilities` to the MongoDB

Add `port-forward` on MongoDB pod:

```bash
kubectl -n <namespace> port-forward svc/<mongo-svc> 27017:27017
```

Connect MongoDB instance:

```bash
mongosh --port 27017 --username <username> --authenticationDatabase admin --password <password>
```

Use the `kdl` database:

```bash
use kdl
```

Insert `capabilites`:

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
