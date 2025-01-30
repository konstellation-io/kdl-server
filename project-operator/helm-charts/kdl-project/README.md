# kdl-project

A Helm chart to deploy KDL projects

## Description

This Helm chart deploys the core components of a Kubernetes Data Lab (KDL) project, providing essential tools for data scientists and machine learning engineers in a Kubernetes-native environment. Overview The KDL Project chart creates a complete development environment for data science and machine learning workflows.

## How works

### Default values

`values.yaml` its contains all the default configurations for the core services of a KDL project, specifically MLflow and Filebrowser:

* Resource allocations
* Security configurations
* Network policies
* Storage settings
* Service ports and endpoints

### Overriding values from `kdl-server` Helm chart

`kdl-server`` Helm chart, which is the main deployment chart, has the power to override these default values. When kdl-server deploys, can provide its own values that take precedence over the defaults.

For example, if the default values specify:

```yaml
  replicaCount: 1
  resources:
    limits:
      memory: "128Mi"
```

The `kdl-server` chart might override these with:

```yaml
mlflow:
  replicaCount: 2
  resources:
    limits:
      memory: "256Mi"
```

This override mechanism is particularly powerful because it allows for environment-specific configurations while maintaining a consistent base configuration. The project operator, which is included in the kdl-server deployment, uses these final merged values when creating and managing KDL projects.

## Components

### Filebrowser

A modern web-based file manager that provides:

* Secure file access and management through a web interface
* User authentication and authorization
* File operations (upload, download, modify) with persistence
* Integration with Kubernetes storage systems

### MLflow

A platform for the machine learning lifecycle that offers:

* Experiment tracking and management
* Model registry and versioning
* Integration with various ML frameworks
* Artifact storage with MinIO/S3 compatibility
* Metric visualization and comparison

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| ialejandro | <ivan.alejandro@intelygenz.com> |  |
| alpiquero | <angelluis.piquero@intelygenz.com> |  |
| danielchg | <daniel.chavero@intelygenz.com> |  |

## Prerequisites

* Helm 3+
* Kubernetes 1.26+

## CI values

Go to [ci](./ci) directory to see some examples of how to use this chart.

```console
helm template test . -f ci/ci-values.yaml
```

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| domain | string | `"kdl.local"` | String to set domain to deploy |
| filebrowser | object | `{"affinity":{},"args":["-c","/entrypoint.sh"],"autoscaling":{"enabled":false,"maxReplicas":100,"minReplicas":1,"targetCPUUtilizationPercentage":80},"command":["/bin/sh"],"enabled":true,"env":{"FB_ADDRESS":"0.0.0.0","FB_DATABASE":"/home/filebrowser/database.db","FB_LOG":"stdout","FB_ROOT":"/srv"},"envFromConfigMap":{},"envFromFiles":[],"envFromSecrets":{},"extraContainers":[],"image":{"pullPolicy":"IfNotPresent","repository":"konstellation/kdl-filebrowser","tag":"latest"},"imagePullSecrets":[],"initContainers":[],"lifecycle":{},"livenessProbe":{"enabled":false,"failureThreshold":3,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5},"livenessProbeCustom":{},"networkPolicy":{"egress":[],"enabled":false,"ingress":[],"policyTypes":[]},"nodeSelector":{},"podAnnotations":{},"podDisruptionBudget":{"enabled":false,"maxUnavailable":1,"minAvailable":null},"podLabels":{},"podSecurityContext":{},"readinessProbe":{"enabled":false,"failureThreshold":3,"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":1},"readinessProbeCustom":{},"replicaCount":1,"resources":{},"securityContext":{},"service":{"port":9696,"type":"ClusterIP"},"serviceAccount":{"annotations":{},"automount":true,"create":true,"name":""},"startupProbe":{"enabled":false,"failureThreshold":30,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5},"startupProbeCustom":{},"terminationGracePeriodSeconds":30,"tolerations":[],"topologySpreadConstraints":[],"volumeMounts":[],"volumes":[]}` | Filebrowser sevice </br> Ref: https://filebrowser.org |
| filebrowser.affinity | object | `{}` | Affinity for pod assignment </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity |
| filebrowser.args | list | `["-c","/entrypoint.sh"]` | Configure args </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/ |
| filebrowser.autoscaling | object | `{"enabled":false,"maxReplicas":100,"minReplicas":1,"targetCPUUtilizationPercentage":80}` | Autoscaling with CPU or memory utilization percentage </br> Ref: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/ |
| filebrowser.command | list | `["/bin/sh"]` | Configure command </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/ |
| filebrowser.enabled | bool | `true` | Enable or disable fllebrowser |
| filebrowser.env | object | `{"FB_ADDRESS":"0.0.0.0","FB_DATABASE":"/home/filebrowser/database.db","FB_LOG":"stdout","FB_ROOT":"/srv"}` | Environment variables to configure application |
| filebrowser.envFromConfigMap | object | `{}` | Variables from configMap |
| filebrowser.envFromFiles | list | `[]` | Load all variables from files </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/#configure-all-key-value-pairs-in-a-configmap-as-container-environment-variables |
| filebrowser.envFromSecrets | object | `{}` | Variables from secrets |
| filebrowser.extraContainers | list | `[]` | Configure extra containers |
| filebrowser.image | object | `{"pullPolicy":"IfNotPresent","repository":"konstellation/kdl-filebrowser","tag":"latest"}` | Image registry The image configuration for the base service |
| filebrowser.imagePullSecrets | list | `[]` | Specifies the secrets to use for pulling images from private registries Leave empty if no secrets are required E.g. imagePullSecrets:   - name: myRegistryKeySecretName |
| filebrowser.initContainers | list | `[]` | Configure additional containers </br> Ref: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/ |
| filebrowser.lifecycle | object | `{}` | Configure lifecycle hooks </br> Ref: https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/ </br> Ref: https://learnk8s.io/graceful-shutdown |
| filebrowser.livenessProbe | object | `{"enabled":false,"failureThreshold":3,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure liveness checker </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes |
| filebrowser.livenessProbeCustom | object | `{}` | Custom livenessProbe |
| filebrowser.networkPolicy | object | `{"egress":[],"enabled":false,"ingress":[],"policyTypes":[]}` | NetworkPolicy configuration </br> Ref: https://kubernetes.io/docs/concepts/services-networking/network-policies/ |
| filebrowser.networkPolicy.enabled | bool | `false` | Enable or disable NetworkPolicy |
| filebrowser.networkPolicy.policyTypes | list | `[]` | Policy types |
| filebrowser.nodeSelector | object | `{}` | Node labels for pod assignment </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector |
| filebrowser.podAnnotations | object | `{}` | Configure annotations on Pods |
| filebrowser.podDisruptionBudget | object | `{"enabled":false,"maxUnavailable":1,"minAvailable":null}` | Pod Disruption Budget </br> Ref: https://kubernetes.io/docs/reference/kubernetes-api/policy-resources/pod-disruption-budget-v1/ |
| filebrowser.podLabels | object | `{}` | Configure labels on Pods |
| filebrowser.podSecurityContext | object | `{}` | Defines privilege and access control settings for a Pod </br> Ref: https://kubernetes.io/docs/concepts/security/pod-security-standards/ </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ |
| filebrowser.readinessProbe | object | `{"enabled":false,"failureThreshold":3,"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":1}` | Configure readinessProbe checker </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes |
| filebrowser.readinessProbeCustom | object | `{}` | Custom readinessProbe |
| filebrowser.replicaCount | int | `1` | Number of replicas Specifies the number of replicas for the service |
| filebrowser.resources | object | `{}` | Resources limits and requested </br> Ref: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| filebrowser.securityContext | object | `{}` | Defines privilege and access control settings for a Container </br> Ref: https://kubernetes.io/docs/concepts/security/pod-security-standards/ </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ |
| filebrowser.service | object | `{"port":9696,"type":"ClusterIP"}` | Kubernetes service to expose Pod </br> Ref: https://kubernetes.io/docs/concepts/services-networking/service/ |
| filebrowser.service.port | int | `9696` | Kubernetes Service port |
| filebrowser.service.type | string | `"ClusterIP"` | Kubernetes Service type. Allowed values: NodePort, LoadBalancer or ClusterIP |
| filebrowser.serviceAccount | object | `{"annotations":{},"automount":true,"create":true,"name":""}` | Enable creation of ServiceAccount </br> Ref: https://kubernetes.io/docs/concepts/security/service-accounts/ |
| filebrowser.startupProbe | object | `{"enabled":false,"failureThreshold":30,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure startupProbe checker </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes |
| filebrowser.startupProbeCustom | object | `{}` | Custom startupProbe |
| filebrowser.terminationGracePeriodSeconds | int | `30` | Configure Pod termination grace period </br> Ref: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination |
| filebrowser.tolerations | list | `[]` | Tolerations for pod assignment </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/ |
| filebrowser.topologySpreadConstraints | list | `[]` | Control how Pods are spread across your cluster </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/#example-multiple-topologyspreadconstraints |
| filebrowser.volumeMounts | list | `[]` | Additional volumeMounts on the output Deployment definition |
| filebrowser.volumes | list | `[]` | Additional volumes on the output Deployment definition </br> Ref: https://kubernetes.io/docs/concepts/storage/volumes/ </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/ </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/#create-a-pod-that-has-access-to-the-secret-data-through-a-volume |
| fullnameOverride | string | `""` | String to fully override kdl-project.fullname template |
| mlflow | object | `{"affinity":{},"args":[],"autoscaling":{"enabled":false,"maxReplicas":100,"minReplicas":1,"targetCPUUtilizationPercentage":80},"command":[],"enabled":true,"env":{"ARTIFACTS_DIR":"mlflow-artifacts","MLFLOW_BACKEND_STORE_URI":"sqlite:////mlflow/tracking/mlflow.db","MLFLOW_HOST":"0.0.0.0","MLFLOW_PORT":"5000"},"envFromConfigMap":{},"envFromFiles":[],"envFromSecrets":{},"extraContainers":[],"image":{"pullPolicy":"IfNotPresent","repository":"konstellation/kdl-mlflow","tag":"latest"},"imagePullSecrets":[],"ingress":{"annotations":{},"className":"","enabled":false,"hosts":[],"tls":{"enabled":false,"extraTLS":[]}},"initContainers":[],"lifecycle":{},"livenessProbe":{"enabled":false,"failureThreshold":3,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5},"livenessProbeCustom":{},"networkPolicy":{"egress":[],"enabled":false,"ingress":[],"policyTypes":[]},"nodeSelector":{},"persistentVolume":{"accessModes":["ReadWriteOnce"],"annotations":{},"enabled":true,"labels":{},"selector":{},"size":"1Gi","storageClass":"","volumeBindingMode":"","volumeName":""},"podAnnotations":{},"podDisruptionBudget":{"enabled":false,"maxUnavailable":1,"minAvailable":null},"podLabels":{},"podSecurityContext":{"fsGroup":1000},"readinessProbe":{"enabled":false,"failureThreshold":3,"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":1},"readinessProbeCustom":{},"replicaCount":1,"resources":{},"securityContext":{},"service":{"port":5000,"type":"ClusterIP"},"serviceAccount":{"annotations":{},"automount":true,"create":true,"name":""},"startupProbe":{"enabled":false,"failureThreshold":30,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5},"startupProbeCustom":{},"terminationGracePeriodSeconds":30,"tolerations":[],"topologySpreadConstraints":[],"volumeMounts":[],"volumes":[]}` | MLflow sevice </br> Ref: https://mlflow.org/docs/latest/index.html |
| mlflow.affinity | object | `{}` | Affinity for pod assignment </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity |
| mlflow.args | list | `[]` | Configure args </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/ |
| mlflow.autoscaling | object | `{"enabled":false,"maxReplicas":100,"minReplicas":1,"targetCPUUtilizationPercentage":80}` | Autoscaling with CPU or memory utilization percentage </br> Ref: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/ |
| mlflow.command | list | `[]` | Configure command </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/define-command-argument-container/ |
| mlflow.enabled | bool | `true` | Enable or disable mlflow |
| mlflow.env | object | `{"ARTIFACTS_DIR":"mlflow-artifacts","MLFLOW_BACKEND_STORE_URI":"sqlite:////mlflow/tracking/mlflow.db","MLFLOW_HOST":"0.0.0.0","MLFLOW_PORT":"5000"}` | Environment variables to configure application ref: https://mlflow.org/docs/latest/cli.html?highlight=Environment_variables#mlflow-server |
| mlflow.envFromConfigMap | object | `{}` | Variables from configMap |
| mlflow.envFromFiles | list | `[]` | Load all variables from files </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/#configure-all-key-value-pairs-in-a-configmap-as-container-environment-variables |
| mlflow.envFromSecrets | object | `{}` | Variables from secrets |
| mlflow.extraContainers | list | `[]` | Configure extra containers |
| mlflow.image | object | `{"pullPolicy":"IfNotPresent","repository":"konstellation/kdl-mlflow","tag":"latest"}` | Image registry The image configuration for the base service |
| mlflow.imagePullSecrets | list | `[]` | Specifies the secrets to use for pulling images from private registries Leave empty if no secrets are required E.g. imagePullSecrets:   - name: myRegistryKeySecretName |
| mlflow.ingress | object | `{"annotations":{},"className":"","enabled":false,"hosts":[],"tls":{"enabled":false,"extraTLS":[]}}` | Ingress configuration to expose app </br> Ref: https://kubernetes.io/docs/concepts/services-networking/ingress/ |
| mlflow.initContainers | list | `[]` | Configure additional containers </br> Ref: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/ |
| mlflow.lifecycle | object | `{}` | Configure lifecycle hooks </br> Ref: https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/ </br> Ref: https://learnk8s.io/graceful-shutdown |
| mlflow.livenessProbe | object | `{"enabled":false,"failureThreshold":3,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure liveness checker </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes |
| mlflow.livenessProbeCustom | object | `{}` | Custom livenessProbe |
| mlflow.networkPolicy | object | `{"egress":[],"enabled":false,"ingress":[],"policyTypes":[]}` | NetworkPolicy configuration </br> Ref: https://kubernetes.io/docs/concepts/services-networking/network-policies/ |
| mlflow.networkPolicy.enabled | bool | `false` | Enable or disable NetworkPolicy |
| mlflow.networkPolicy.policyTypes | list | `[]` | Policy types |
| mlflow.nodeSelector | object | `{}` | Node labels for pod assignment </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector |
| mlflow.persistentVolume | object | `{"accessModes":["ReadWriteOnce"],"annotations":{},"enabled":true,"labels":{},"selector":{},"size":"1Gi","storageClass":"","volumeBindingMode":"","volumeName":""}` | Persistent Volume configuration </br> Ref: https://kubernetes.io/docs/concepts/storage/persistent-volumes/ |
| mlflow.persistentVolume.accessModes | list | `["ReadWriteOnce"]` | Persistent Volume access modes Must match those of existing PV or dynamic provisioner </br> Ref: http://kubernetes.io/docs/user-guide/persistent-volumes/ |
| mlflow.persistentVolume.annotations | object | `{}` | Persistent Volume annotations |
| mlflow.persistentVolume.enabled | bool | `true` | Enable or disable persistence |
| mlflow.persistentVolume.labels | object | `{}` | Persistent Volume labels |
| mlflow.persistentVolume.selector | object | `{}` | Persistent Volume Claim Selector Useful if Persistent Volumes have been provisioned in advance </br> Ref: https://kubernetes.io/docs/concepts/storage/persistent-volumes/#selector |
| mlflow.persistentVolume.size | string | `"1Gi"` | Persistent Volume size |
| mlflow.persistentVolume.storageClass | string | `""` | Persistent Volume Storage Class If defined, storageClass: <storageClass> If set to "-", storageClass: "", which disables dynamic provisioning If undefined (the default) or set to null, no storageClass spec is   set, choosing the default provisioner.  (gp2 on AWS, standard on   GKE, AWS & OpenStack) |
| mlflow.persistentVolume.volumeBindingMode | string | `""` | Persistent Volume Binding Mode If defined, volumeBindingMode: <volumeBindingMode> If undefined (the default) or set to null, no volumeBindingMode spec is set, choosing the default mode. |
| mlflow.persistentVolume.volumeName | string | `""` | Persistent Volume Name Useful if Persistent Volumes have been provisioned in advance and you want to use a specific one |
| mlflow.podAnnotations | object | `{}` | Configure annotations on Pods |
| mlflow.podDisruptionBudget | object | `{"enabled":false,"maxUnavailable":1,"minAvailable":null}` | Pod Disruption Budget </br> Ref: https://kubernetes.io/docs/reference/kubernetes-api/policy-resources/pod-disruption-budget-v1/ |
| mlflow.podLabels | object | `{}` | Configure labels on Pods |
| mlflow.podSecurityContext | object | `{"fsGroup":1000}` | Defines privilege and access control settings for a Pod </br> Ref: https://kubernetes.io/docs/concepts/security/pod-security-standards/ </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ |
| mlflow.readinessProbe | object | `{"enabled":false,"failureThreshold":3,"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":1}` | Configure readinessProbe checker </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes |
| mlflow.readinessProbeCustom | object | `{}` | Custom readinessProbe |
| mlflow.replicaCount | int | `1` | Number of replicas Specifies the number of replicas for the service |
| mlflow.resources | object | `{}` | Resources limits and requested </br> Ref: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| mlflow.securityContext | object | `{}` | Defines privilege and access control settings for a Container </br> Ref: https://kubernetes.io/docs/concepts/security/pod-security-standards/ </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/ |
| mlflow.service | object | `{"port":5000,"type":"ClusterIP"}` | Kubernetes service to expose Pod </br> Ref: https://kubernetes.io/docs/concepts/services-networking/service/ |
| mlflow.service.port | int | `5000` | Kubernetes Service port |
| mlflow.service.type | string | `"ClusterIP"` | Kubernetes Service type. Allowed values: NodePort, LoadBalancer or ClusterIP |
| mlflow.serviceAccount | object | `{"annotations":{},"automount":true,"create":true,"name":""}` | Enable creation of ServiceAccount </br> Ref: https://kubernetes.io/docs/concepts/security/service-accounts/ |
| mlflow.startupProbe | object | `{"enabled":false,"failureThreshold":30,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure startupProbe checker </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/#define-startup-probes |
| mlflow.startupProbeCustom | object | `{}` | Custom startupProbe |
| mlflow.terminationGracePeriodSeconds | int | `30` | Configure Pod termination grace period </br> Ref: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination |
| mlflow.tolerations | list | `[]` | Tolerations for pod assignment </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/ |
| mlflow.topologySpreadConstraints | list | `[]` | Control how Pods are spread across your cluster </br> Ref: https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/#example-multiple-topologyspreadconstraints |
| mlflow.volumeMounts | list | `[]` | Additional volumeMounts on the output Deployment definition |
| mlflow.volumes | list | `[]` | Additional volumes on the output Deployment definition </br> Ref: https://kubernetes.io/docs/concepts/storage/volumes/ </br> Ref: https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/ </br> Ref: https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/#create-a-pod-that-has-access-to-the-secret-data-through-a-volume |
| nameOverride | string | `""` | String to partially override kdl-project.fullname template (will maintain the release name) |
| projectId | string | `"my-project"` | String unique to identify KDL project |
