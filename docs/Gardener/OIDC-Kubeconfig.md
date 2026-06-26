# AUTHENTICATION

Reference:
https://github.com/int128/kubelogin/blob/master/docs/setup.md


## Question:

You need figure out what the relation of gardenctl/kubelogin/gardenlogin OIDC 

### Configurations
```
/home/USER001/.garden/config ?? 
/home/USER001/.kube/kubeconfig ??

gardenctl ??

```


```
USER001@WS-HOST001 ~ garden-lab--sit081-external$ kubectl oidc-login setup --oidc-issuer-url=https://gardener-live.accounts.ppdemands.com --oidc-client-id=00000000-0000-4000-8000-000000000001
authentication in progress...
/usr/bin/xdg-open: 882: www-browser: not found
/usr/bin/xdg-open: 882: links2: not found
/usr/bin/xdg-open: 882: elinks: not found
/usr/bin/xdg-open: 882: links: not found
/usr/bin/xdg-open: 882: lynx: not found
/usr/bin/xdg-open: 882: w3m: not found
xdg-open: no method available for opening 'http://localhost:8000'
error: could not open the browser: exit status 3

Please visit the following URL in your browser manually: http://localhost:8000

## 2. Verify authentication

You got a token with the following claims:

{
  "sub": "user@example.com",
  "iss": "https://gardener-live.accounts.ppdemands.com",
  "groups": "employee",
  "last_name": "Chen",
  "display_name": "Chen, Bryan",
  "nonce": "tYnyK50rPuMZx0aAQZuQPzlqcJinLhZXrrR2iQDv4FE",
  "sid": "S-SP-00000000-0000-4000-8000-000000000001",
  "aud": "00000000-0000-4000-8000-000000000001",
  "exp": 1752502013,
  "iat": 1752498413,
  "first_name": "Bryan",
  "jti": "00000000-0000-4000-8000-000000000002",
  "email": "user@example.com"
}

## 3. Bind a cluster role

Run the following command:

        kubectl create clusterrolebinding oidc-cluster-admin --clusterrole=cluster-admin --user='https://gardener-live.accounts.ppdemands.com#user@example.com'

## 4. Set up the Kubernetes API server

Add the following options to the kube-apiserver:

        --oidc-issuer-url=https://gardener-live.accounts.ppdemands.com
        --oidc-client-id=00000000-0000-4000-8000-000000000001

## 5. Set up the kubeconfig

Run the following command:

        kubectl config set-credentials oidc \
          --exec-api-version=client.authentication.k8s.io/v1beta1 \
          --exec-command=kubectl \
          --exec-arg=oidc-login \
          --exec-arg=get-token \
          --exec-arg=--oidc-issuer-url=https://gardener-live.accounts.ppdemands.com \
          --exec-arg=--oidc-client-id=00000000-0000-4000-8000-000000000001

## 6. Verify cluster access

Make sure you can access the Kubernetes cluster.

        kubectl --user=oidc get nodes

You can switch the default context to oidc.

        kubectl config set-context --current --user=oidc

You can share the kubeconfig to your team members for on-boarding.

```