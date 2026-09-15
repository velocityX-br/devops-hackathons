

If downstream Zone's serial number is higher down upstreamers then regular `notify`. You must `rndc retransfer` from the slaves, in order to force the sync.


Check if SOA is matching between master and slave.
```
#!/bin/bash


### # dig @dns01-eu soa od.sap.biz +short
### example.com. DL_example.com/redacted. 2306261097 3600 1800 604800 180
### # dig @dns02-eu soa od.sap.biz +short
### example.com. DL_example.com/redacted. 2306261097 3600 1800 604800 180
### # dns-api dig global @0  soa od.sap.biz +short
### example.com. DL_example.com/redacted. 2306261097 3600 1800 604800 180


for domain in ams7.od.sap.biz ash.od.sap.biz example.com/redacted example.com/redacted example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com example.com cos1.od.sap.biz dev.eu-de-1.devsys.net.sap dev.od.sap.biz dev2.od.sap.biz dxb1.od.sap.biz example.com/redacted example.com/redacted example.com/redacted example.com/redacted example.com/redacted example.com/redacted example.com/redacted example.com/redacted fip.dev.eu-de-1.devsys.net.sap fip.vlab.eu-de-1.devsys.net.sap fra1.od.sap.biz fra2.od.sap.biz gmp.od.sap.biz hcpp.od.sap.biz lab.od.sap.biz example.com example.com net.od.sap.biz example.com example.com od.sap.biz phx.od.sap.biz example.com example.com rot.od.sap.biz ryd1.od.sap.biz sha3.od.sap.biz example.com/redacted example.com/redacted example.com/redacted example.com/redacted example.com/redacted example.com/redacted example.com/redacted example.com/redacted example.com/redacted spa3.od.sap.biz example.com staging.od.sap.biz example.com/redacted example.com/redacted example.com/redacted example.com/redacted stl1.od.sap.biz stl2.od.sap.biz syd.od.sap.biz example.com example.com example.com tor1.od.sap.biz tyo1.od.sap.biz example.com vlab.eu-de-1.devsys.net.sap vlab.od.sap.biz

do
   echo "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -"
   echo -n "${domain}"

   ERROR="0"
   DNS01=$(dig @dns01-eu soa ${domain} +short)
   DNS02=$(dig @dns02-eu soa ${domain} +short)
   DNSHM=$(dns-api dig global @0 soa ${domain} +short)

   if [[ "${DNSHM}" != "${DNS01}" ]] && [[ "${DNSHM}" != "${DNS02}" ]]; then
      echo " does not match."
      echo "DNSHM: ${DNSHM}"
      echo "DNS01: ${DNS01}"
      echo "DNS02: ${DNS02}"
   fi
   echo
done
```