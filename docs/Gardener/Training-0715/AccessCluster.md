


https://gardener.cloud/docs/gardener/shoot/shoot_access/#shootsadminkubeconfig-subresource
```
USER001@WS-HOST001 ~ garden-team-a$ echo $NAMESPACE $SHOOT_NAME
garden-sn1 sit081
USER001@WS-HOST001 ~ garden-team-a$ kubectl create     -f <(printf '{"spec":{"expirationSeconds":600}}')     --raw /apis/core.gardener.cloud/v1beta1/namespaces/${NAMESPACE}/shoots/${SHOOT_NAME}/adminkubeconfig |     jq -r ".status.kubeconfig" |     base64 -d
```