package k8s

import "errors"

var errCRDNoMetadata = errors.New("CRD does not have a 'metadata' field")
var errCRDNoSpec = errors.New("CRD does not have a 'spec' field")
var errCRDNoSpecMlflow = errors.New("CRD does not have a 'spec.mlflow' field")
var errCRDNoSpecMlflowEnv = errors.New("CRD does not have a 'spec.mlflow.env' field")
var errCRDNoSpecMlflowPersistentVolume = errors.New("CRD does not have a 'spec.mlflow.persistentVolume' field")
var errCRDNoSpecFilebrowser = errors.New("CRD does not have a 'spec.filebrowser' field")
var errCRDNoSpecFilebrowserEnv = errors.New("CRD does not have a 'spec.filebrowser.env' field")
var errCRDNoSpecVscodeRuntime = errors.New("CRD does not have a 'spec.vscodeRuntime' field")
var errCRDNoSpecVscodeRuntimeEnv = errors.New("CRD does not have a 'spec.vscodeRuntime.env' field")
var errCRDNoSpecVscodeRuntimeImage = errors.New("CRD does not have a 'spec.vscodeRuntime.image' field")
var errCRDNoSpecPodLabels = errors.New("CRD does not have a 'spec.podLabels' field")
var errCRDCantDecodeInputData = errors.New("can't decode input data from CR")
var errNoPodFound = errors.New("no pod found")
