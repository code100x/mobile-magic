kubectl create namespace monitoring
helm install prometheus prometheus-community/kube-prometheus-stack -f prometheus-values.yaml -n monitoring

## Get grafana password
kubectl --namespace monitoring get secrets prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 -d ; echo

## Get grafana url
export POD_NAME=$(kubectl --namespace monitoring get pod -l "app.kubernetes.io/name=grafana,app.kubernetes.io/instance=prometheus" -oname)
kubectl --namespace monitoring port-forward $POD_NAME 3000

## Get prometheus url
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090