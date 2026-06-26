

```
echo | openssl s_client -connect ccplusDev.rot.s4h.ppdemands.com:443 -servername ccplusDev.rot.s4h.ppdemands.com 2>/dev/null | openssl x509 -noout -text
```