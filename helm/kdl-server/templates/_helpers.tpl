{{/*
Add the protocol part to the uri
*/}}
{{- define "protocol" -}}
  {{ ternary "https" "http" .Values.tls.enabled }}
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
Create minio tls secret name
*/}}
{{- define "minio.tlsSecretName" -}}
{{- if hasKey .Values.minio.ingress.tls "secretName" -}}
  {{- .Values.minio.ingress.tls.secretName -}}
{{- else -}}
  {{- printf "%s-minio-tls" $.Values.domain -}}
{{- end -}}
{{- end -}}

{{/*
Create minio tls secret name
*/}}
{{- define "minioConsole.tlsSecretName" -}}
{{- if hasKey .Values.minio.consoleIngress.tls "secretName" -}}
  {{- .Values.minio.consoleIngress.tls.secretName -}}
{{- else -}}
  {{- printf "%s-minio-console-tls" $.Values.domain -}}
{{- end -}}
{{- end -}}

{{/*
Create kdlServer tls secret name
*/}}
{{- define "kdlServer.tlsSecretName" -}}
{{- if hasKey .Values.kdlServer.ingress.tls "secretName" -}}
  {{- .Values.kdlServer.ingress.tls.secretName -}}
{{- else -}}
  {{- printf "kdlapp-%s-tls" $.Values.domain -}}
{{- end -}}
{{- end -}}

{{/*
Create drone tls secret name
*/}}
{{- define "drone.tlsSecretName" -}}
{{- if hasKey .Values.drone.ingress.tls "secretName" -}}
  {{- .Values.drone.ingress.tls.secretName -}}
{{- else -}}
  {{- printf "drone-%s-tls" $.Values.domain -}}
{{- end -}}
{{- end -}}

{{/*
Create gitea tls secret name
*/}}
{{- define "gitea.tlsSecretName" -}}
{{- if hasKey .Values.gitea.ingress.tls "secretName" -}}
  {{- .Values.gitea.ingress.tls.secretName -}}
{{- else -}}
  {{- printf "gitea-%s-tls" $.Values.domain -}}
{{- end -}}
{{- end -}}

{{/*
Create user-tools tls secret name
*/}}
{{- define "userTools.tlsSecretName" -}}
{{- if hasKey .Values.userToolsOperator.ingress.tls "secretName" -}}
  {{- .Values.userToolsOperator.ingress.tls.secretName -}}
{{- else -}}
  {{- printf "user-tools-%s-tls" $.Values.domain -}}
{{- end -}}
{{- end -}}
