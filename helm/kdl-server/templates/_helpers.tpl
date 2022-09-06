{{/*
Add the protocol part to the uri
*/}}
{{- define "http.protocol" -}}
  {{ ternary "https" "http" .Values.global.ingress.tls.enabled }}
{{- end -}}

{{/*
Create MongoDB URI.
*/}}
{{- define "kdl.mongoURI" -}}
  {{- printf "mongodb://%s:%s@kdl-mongo-0:27017/admin" $.Values.mongodb.auth.adminUser $.Values.mongodb.auth.adminPassword -}}
{{- end -}}

{{/* Create the name of knowledge-galaxy service account to use */}}
{{- define "knowledgeGalaxy.serviceAccountName" -}}
{{- if .Values.knowledgeGalaxy.serviceaccount.enabled -}}
    {{ default "knowledge-galaxy" .Values.knowledgeGalaxy.serviceaccount.name }}
{{- end -}}
{{- end -}}

{{/*
Global tls secret name
*/}}
{{- define "global.tlsSecretName" -}}
{{-  if hasKey .Values.global.ingress.tls "secretName" -}}
  {{- .Values.global.ingress.tls.secretName -}}
{{- else -}}
  {{- printf "%s-%s-tls" $.Values.global.domain $.appName -}}
{{- end -}}
{{- end -}}

{{/*
Create minio tls secret name
*/}}
{{- define "minio.tlsSecretName" -}}
{{- if hasKey .Values.minio.ingress.tls "secretName" -}}
  {{- .Values.minio.ingress.tls.secretName -}}
{{- else -}}
  {{- $_ := set $ "appName" "minio" }}
  {{- include "global.tlsSecretName" . -}}
{{- end -}}
{{- end -}}

{{/*
Create minio tls secret name
*/}}
{{- define "minioConsole.tlsSecretName" -}}
{{- if hasKey .Values.minio.consoleIngress.tls "secretName" -}}
  {{- .Values.minio.consoleIngress.tls.secretName -}}
{{- else -}}
  {{- $_ := set $ "appName" "minio-console" }}
  {{- include "global.tlsSecretName" . -}}
{{- end -}}
{{- end -}}

{{/*
Create kdlServer tls secret name
*/}}
{{- define "kdlServer.tlsSecretName" -}}
{{- if hasKey .Values.kdlServer.ingress.tls "secretName" -}}
  {{- .Values.kdlServer.ingress.tls.secretName -}}
{{- else -}}
  {{- $_ := set $ "appName" "kdlapp" }}
  {{- include "global.tlsSecretName" . -}}
{{- end -}}
{{- end -}}

{{/*
Create drone tls secret name
*/}}
{{- define "drone.tlsSecretName" -}}
{{- if hasKey .Values.drone.ingress.tls "secretName" -}}
  {{- .Values.drone.ingress.tls.secretName -}}
{{- else -}}
  {{- $_ := set $ "appName" "drone" }}
  {{- include "global.tlsSecretName" . -}}
{{- end -}}
{{- end -}}

{{/*
Create gitea tls secret name
*/}}
{{- define "gitea.tlsSecretName" -}}
{{- if hasKey .Values.gitea.ingress.tls "secretName" -}}
  {{- .Values.gitea.ingress.tls.secretName -}}
{{- else -}}
  {{- $_ := set $ "appName" "gitea" }}
  {{- include "global.tlsSecretName" . -}}
{{- end -}}
{{- end -}}

{{/*
Create user-tools tls secret name
*/}}
{{- define "userTools.tlsSecretName" -}}
{{- if hasKey .Values.userToolsOperator.ingress.tls "secretName" -}}
  {{- .Values.userToolsOperator.ingress.tls.secretName -}}
{{- else -}}
  {{- $_ := set $ "appName" "user-tools" }}
  {{- include "global.tlsSecretName" . -}}
{{- end -}}
{{- end -}}

{{/*
Create projectOperator mlflow tls secret name
*/}}
{{- define "projectOperator.mlflow.tlsSecretName" -}}
{{- if hasKey .Values.projectOperator.mlflow.ingress.tls "secretName" -}}
  {{- .Values.projectOperator.mlflow.ingress.tls.secretName -}}
{{- else -}}
  {{- $_ := set $ "appName" "project-operator" }}
  {{- include "global.tlsSecretName" . -}}
{{- end -}}
{{- end -}}
