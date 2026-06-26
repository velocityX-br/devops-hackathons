



#### Bug1:  dns-api transation stuck in PS
`dns-api` won't update view list from primary slave with `dns-api view list` while the former transaction is still running. 

Solution: You will have to `dns-api work status` and `dns-api work commit` from PS then re-run `/usr/bin/dns-api-check-slaves -d` from HM. SO! Be careful with `failed with exit:42 signal:0`

```
checking primary slave 10.0.0.1
*** running remotely dns-api@10.0.0.1: sudo dns-api --log-reads view list
Transaction in process
Running cmd 'sudo dns-api --log-reads view list' failed with exit:42 signal:0
W: 10.0.0.1: dns-api command 'view list' on primary slave: running remote command ssh dns-api@10.0.0.1 sudo dns-api --log-reads view list (exit=42 signal=0)
fixing primary slave 10.0.0.2
*** running remotely dns-api@10.0.0.2: sudo dns-api --log-reads work begin
no changes on 10.0.0.2
*** running remotely dns-api@10.0.0.2: sudo dns-api --log-reads work rollback
skipping primary slave 10.0.0.1 because of previous errors
```