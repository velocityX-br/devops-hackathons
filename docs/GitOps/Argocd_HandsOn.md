

```
# Allow disabling auto-sync temporarily

  # allow-temporarily-toggling-auto-sync
  ignoreApplicationDifferences:
    - jsonPointers:
        - /spec/syncPolicy
```

`argocd app delete plat-a-fluentbit --cascade -y`