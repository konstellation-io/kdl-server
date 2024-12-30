package k8s

import "errors"

var errCRDNoMetadata = errors.New("CRD does not have a 'metadata' field")
var errCRDNoSpec = errors.New("CRD does not have a 'spec' field")
var errCRDNoSpecMlflow = errors.New("CRD does not have a 'spec.mlflow' field")
var errCRDNoSpecMlflowEnv = errors.New("CRD does not have a 'spec.mlflow.env' field")
var errCRDNoSpecVscodeRuntime = errors.New("CRD does not have a 'spec.vscodeRuntime' field")
var errCRDNoSpecVscodeRuntimeImage = errors.New("CRD does not have a 'spec.vscodeRuntime.image' field")
var errCRDNoSpecPodLabels = errors.New("CRD does not have a 'spec.podLabels' field")
