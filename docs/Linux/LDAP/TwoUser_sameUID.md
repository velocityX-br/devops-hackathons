**Issue description**: 
two user tfc and test are using the same uidNumber 458. 

vm-host001:~ # getent passwd tfc
tfc:*:458:79:tfc:/home/tfc:/bin/bash
vm-host001:~ # getent passwd test
test:*:458:79:tfc:/home/tfc:/bin/bash
vm-host001:~ #
vm-host001:~ # id test
uid=458(test) gid=79(pppsys) groups=79(pppsys)
vm-host001:~ #
vm-host001:~ # id tfc
uid=458(test) gid=79(pppsys) groups=79(pppsys)

vm-host001:~ # ll /usr/example/trans80/
total 24488
-rw-r--r-- 1 test pppsys 112 Feb 8 2012 00README
drwxrwx--- 174 test pppsys 194650112 May 21 10:35 actlog
drwxrwx--- 3 test pppsys 176128 May 6 09:39 bin
drwxrwx--- 8 test pppsys 376832 May 17 13:58 buffer
drwxrwx--- 2 test pppsys 23252992 May 21 12:15 cofiles
drwxrwx--- 2 test pppsys 4096 May 16 2021 custom
drwxrwx--- 3 test pppsys 18292736 May 21 12:15 data

**Analysis**:

>  ldapsearch -ZZ -LLL -H ldap://ldap-eude2-spc.env-a-spc-tic.plat-a.eu-de-2.cloud.pppdemands.com -b dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example -D cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example -W \
>  "(uid=test)" creatorsName createTimestamp
Enter LDAP Password:
dn: uid=test,ou=users,ou=SVC-A-EUDE2-VLAB,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=
 cloud,dc=example
creatorsName: uid=USER005,ou=users,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=
 cloud,dc=example
createTimestamp: 20220420101428Z

**如何通过检查某个用户是否有LDAP写的权限**

`include         /etc/openldap/inc.access` defined in `/etc/openldap/slapd.conf` 
File: /etc/openldap/inc.access 
OpenLDAP 的 ACL 通常配置在 slapd.conf 文件中或通过动态配置（使用 olcAccess 属性）。

```
access to dn.subtree="ou=SVC-A-EUDE2-VLAB,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example"
 by set="([cn=SVC-A_CC_LDAP_WRITE,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" write
 by set="([cn=SVC-A_CC_LDAP_READ,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" read
 by * none
```

```
access to *
 by anonymous auth
 by dn.exact="cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example" read
 by dn.exact="cn=nagios,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example" read
 by dn.exact="cn=prc,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example" write
 by dn.exact="cn=adssync,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example" write
 by group.exact="cn=ldapadmins,ou=groups,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example" write
 by set="([cn=PLAT-A_ENV-A_ADMINS,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" write
 by * none break

access to dn.base="dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example"
 by set="([cn=SVC-A_CC_LDAP_WRITE,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" read
 by set="([cn=SVC-A_CC_LDAP_READ,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" read
 by * none

access to dn.subtree="ou=SVC-A-EUDE2-PROD,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example"
 by set="([cn=SVC-A_CC_LDAP_WRITE,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" write
 by set="([cn=SVC-A_CC_LDAP_READ,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" read
 by * none

access to dn.subtree="ou=SVC-A-EUDE2-TOOLS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example"
 by set="([cn=SVC-A_CC_LDAP_WRITE,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" write
 by set="([cn=SVC-A_CC_LDAP_READ,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" read
 by * none

access to dn.subtree="ou=SVC-A-EUDE2-VLAB,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example"
 by set="([cn=SVC-A_CC_LDAP_WRITE,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" write
 by set="([cn=SVC-A_CC_LDAP_READ,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example])/memberUid & user/uid" read
 by * none
/etc/openldap/inc.access lines 1-29/29 (END)
```


// From Pamela 
The issue is because of two tech users("tfc" and "test") are now using same uidNumber 458.  "tfc" and "test" were created by SVC-A colleagues who have the OU "SVC-A-EUDE2-VLAB" write permission, Colleague A (USER001) from SVC-A can support to check and do adjustment to make sure unique uidNumber is used per tech user. Our team cannot directly do the adjustment in SVC-A self managed OU. Could you please notify Colleague A directly? I have also set up a chat group with Colleague A and you.
vsa-host001:~ # ldapsearch -LLL -o ldif-wrap=no -H ldaps://ldap-eude2-spc.env-a-spc-tic.plat-a.eu-de-2.cloud.pppdemands.com -b dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example -D cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example -W uidNumber=
458
dn
Enter LDAP Password:
dn: uid=
tfc
,ou=users,ou=SVC-A-EUDE2-VLAB,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example
dn: uid=
test
,ou=users,ou=SVC-A-EUDE2-VLAB,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example
Regards,
Pamela Mei