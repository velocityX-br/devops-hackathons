
example.com 

```
# Traefik Middlewares that strip the /my and /your path prefixes before forwarding to each backend.
# The replacement /$2 keeps everything after the prefix, forwarding / to the backend root.
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: strip-prefix-my
spec:
  replacePathRegex:
    regex: ^/my(/|$)(.*)
    replacement: /$2
---
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: strip-prefix-your
spec:
  replacePathRegex:
    regex: ^/your(/|$)(.*)
    replacement: /$2
---
```