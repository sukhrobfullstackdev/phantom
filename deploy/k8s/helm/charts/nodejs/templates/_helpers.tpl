{{/*
Concat image with tag
*/}}
{{- define "appContainer.fullImageName" -}}
{{ required "image must be entered" .Values.deployment.appContainer.image }}:{{ required "tag must be entered" .Values.deployment.appContainer.tag }}
{{- end }}

{{/*
Define name depending on environment/deployEnv
*/}}
{{- define "magic-app.name" -}}
{{- if .Values.environment }}
{{- .Values.prefix }}-{{ .Values.environment }}
{{- else }}
{{- .Values.prefix }}-{{ .Values.deployEnv }}
{{- end }}
{{- end }}

{{/*
Define env. vars. config map name
*/}}
{{- define "magic-app.nameEnvConfigMap" -}}
{{ template "magic-app.name" . }}-env
{{- end }}

{{/*
Define env. vars. secret name
*/}}
{{- define "magic-app.nameSecretEnv" -}}
{{ template "magic-app.name" . }}-env
{{- end }}

{{/*
  Following values are needed for compatibility with a new K8s cluster.
  Should be mandatory starting from April 30 2023
*/}}

{{/*
Pod labels
*/}}
{{- define "magic-app.podLabels" -}}
tags.datadoghq.com/service: {{ include "magic-app.name" . }}
app.kubernetes.io/version: {{ .Values.version | default "none" | quote }}
app.kubernetes.io/name: {{ include "magic-app.name" . }}
app.kubernetes.io/instance: {{ include "magic-app.name" . }}
{{- range $k, $v := .Values.commonLabels }}
{{ $k }}: {{ $v | quote }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "magic-app.selectorLabels" -}}
app: {{ include "magic-app.name" . }}
deploy_env: {{ .Values.deployEnv }}
region: {{ .Values.region | default "us-west-2" }}
part_of: {{ include "magic-app.name" . }}
{{- end }}
