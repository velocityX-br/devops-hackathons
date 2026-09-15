


```


# How to check CA Bundles
awk '/-----BEGIN CERTIFICATE-----/{n++; filename="cert_" n ".pem"} {print > filename}' ca_bundle.cer

# Check PEM
for cert in cert_*.pem; do echo "=== $cert ==="; openssl x509 -in $cert -text -noout | grep -E "Issuer|Subject|Not Before|Not After"; done

echo | openssl s_client -connect ccplusDev.rot.s4h.ppdemands.com:443 -servername ccplusDev.rot.s4h.ppdemands.com 2>/dev/null | openssl x509 -noout -text
```