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
