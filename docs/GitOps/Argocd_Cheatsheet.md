

```
# Allow disabling auto-sync temporarily

  # allow-temporarily-toggling-auto-sync
  ignoreApplicationDifferences:
    - jsonPointers:
        - /spec/syncPolicy
```

How to make cleanup of an ArgoCD application: https://jira.tools.pppdemands.com/browse/PROJ-A-21126

```
- argocd app delete plat-a-fluentbit --cascade -y
- argocd app delete plat-a-fluentbit --cascade -y
- argocd app delete ansible-fluentbit --cascade -y
```