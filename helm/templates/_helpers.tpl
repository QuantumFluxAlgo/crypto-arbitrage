{{/*
Expand the name of the chart.
*/}}
{{- define "crypto-arbitrage.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a fullname using the release name.
*/}}
{{- define "crypto-arbitrage.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "crypto-arbitrage.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "crypto-arbitrage.labels" -}}
app.kubernetes.io/name: {{ include "crypto-arbitrage.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ include "crypto-arbitrage.chart" . }}
{{- end -}}

{{/*
Chart name and version
*/}}
{{- define "crypto-arbitrage.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" -}}
{{- end -}}
