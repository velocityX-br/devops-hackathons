
Update 20260626

```
# Check AD Attributes of individual user
ldapsearch -ZZ -LLL   -h adldap.global.corp.ppp   -D "i5pp@global.corp.ppp"   -w "$pwd"   -b "CN=Ipppp,OU=I,OU=Identities,DC=global,DC=corp,DC=ppp"   "(objectClass=*)"

# Global search based on specific mail
ldapsearch -ZZ -LLL \
  -h adldap.global.corp.ppp \
  -b "DC=global,DC=corp,DC=ppp" \
  -D "ptechnicaluserpp@global.corp.ppp" \
  -w "$pwd" \
  "(proxyAddresses=SMTP:DL_0176000ppp@global.corp.ppp)"

# Global accurate search or vague search
bash-4.4$ ldapsearch -ZZ -LLL -h adldap.global.corp.ppp -b DC=global,DC=corp,DC=ppp -D <USER_ID>@global.corp.ppp -w $pwd  CN=6A1A0F56BC548ACE3Fppp
```

Experience
```
新的Runtime 在OPENLDAP服务端创建OU  AD2LDAP是把AD中用户结果的认证资料同步到OPENLDAP

ldapsearch -x -H ldaps://ldap-eude1-env-a-test.env-a-testing.plat-a.eu-de-1.cloud.pppdemands.com -b dc=env-a-testing,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example "(CN=SVC-A_CC_OSAccess_oadev)"

ldapsearch -o ldif-wrap=no -ZZ -LLL -h adldap.global.pppdemands.com -b DC=global,DC=ppdemands,DC=com -D svc-ldap@example.com -w $pwd cn=CAM_TEAMA_* dn 

ldapsearch -ZZ -LLL -h adldap.global.pppdemands.com -b DC=global,DC=ppdemands,DC=com -D svc-ldap@example.com -w $pwd cn=cam_si_devops_argocd_owner

ldapsearch -x -H ldaps://ldap-eude1-env-a-test.env-a-testing.plat-a.eu-de-1.cloud.pppdemands.com -b dc=env-a-testing,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example "(&(objectClass=posixGroup)(CN=BTP_NEO_ATOM_HOTFIX_APPROVER))"

ldapsearch -x -H ldaps://ldap-eude1-env-a-test.env-a-testing.plat-a.eu-de-1.cloud.pppdemands.com -b dc=env-a-testing,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example "(uid=USER001)"

ldapsearch -LLL -o ldif-wrap=no -H ldaps://ldap-eude1-spc.env-a-spc-tic.plat-a.eu-de-1.cloud.pppdemands.com -b ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example -D cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example -W CN=CLM_AM_SCC_VLAB_SUBADMIN

# Final validation
vsa-host001:/var/log #    ldapsearch -LLL -o ldif-wrap=no -H ldaps://ldap-eude1-spc.env-a-spc-tic.plat-a.eu-de-1.cloud.pppdemands.com -b ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example -D cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example -W CN=SVC-A_CC_OSACCESS_OADEV
Enter LDAP Password:
dn: cn=SVC-A_CC_OSACCESS_OADEV,ou=groups,ou=ADS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example
objectClass: top
objectClass: posixGroup
cn: SVC-A_CC_OSACCESS_OADEV
gidNumber: 58006
```


```
ldapsearch -x \
  -H ldap://adldap.global.pppdemands.com \
  -ZZ \
  -D "svc-jumphost@example.com" \
  -W \
  -b "" \
  -s base


ldapsearch -x \
  -H ldap://adldap.global.pppdemands.com \
  -ZZ \
  -D "svc-jumphost@example.com" \
  -W \
  -b "" \
  -s base
ONQ0uxxxx
```


```
# Check user's details in LDAP 
ldapsearch -o ldif-wrap=no -LLL -H ldaps://ldap-eude2-spc.env-a-spc-tic.plat-a.eu-de-2.cloud.pppdemands.com -b dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example -D cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example -w $pwd cn=nzaadm dn


ldapsearch -o ldif-wrap=no -LLL \
  -H ldaps://ldap-eude2-spc.env-a-spc-tic.plat-a.eu-de-2.cloud.pppdemands.com \
  -b dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example \
  -D cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example \
  -W \  # Prompt for password (do not embed plaintext)
  "(objectClass=organizationalUnit)" ou

```


```

ldapsearch -LLL -o ldif-wrap=no   -H ldaps://ldap-eude2-spc.env-a-spc-tic.plat-a.eu-de-2.cloud.pppdemands.com   -b "dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example"   -D "cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example"   -W cn=nzaadm
Enter LDAP Password:
dn: uid=nzaadm,ou=users,cn=NZA,ou=SVC-A-EUDE2-PROD,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example
cn: nzaadm
gidNumber: 1002
homeDirectory: /usr/example/NZA/home
sn: nzaadm
uid: nzaadm
gecos: ppp System Administrator
shadowExpire: 99999
objectClass: posixAccount
objectClass: top
objectClass: inetOrgPerson
objectClass: shadowAccount
description: ppp System Administrator
loginShell: /bin/csh
uidNumber: 50805
userPassword:: e1NTSEF9aTdpOUkvckplMW8rbjJ3S0dWai9tSjFyM3FGUWEwWnlZV0p6TVROUA== 

# 深度解释

dc=example
 └─ dc=cloud
     └─ dc=eu-de-2
         └─ dc=plat-a
             └─ dc=env-a-spc-tic
                 └─ ou=SVC-A-EUDE2-PROD
                     └─ cn=NZA                ← 这是一个“组织”或“ppp系统实例”容器（用 cn 而非 ou）
                         └─ ou=users          ← 用户容器
                             └─ uid=nzaadm    ← 具体用户条目

```

```
ldapsearch -x -h ldap-eude1-dev.env-a-dev.plat-a.eu-de-1.cloud.pppdemands.com -LLL uid=USER004 
dn: uid=USER004,ou=users,ou=ADS,dc=env-a-dev,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example

ldapsearch -LLL -o ldif-wrap=no -H ldaps://ldap-eude1-spc.env-a-spc-tic.plat-a.eu-de-1.cloud.pppdemands.com -b dc=env-a-spc-tic,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example -D cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example -W cn=pppadm

ldapsearch -LLL -o ldif-wrap=no -H ldaps://ldap-eude1-spc.env-a-spc-tic.plat-a.eu-de-1.cloud.pppdemands.com -b dc=env-a-spc-tic,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example -D cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-1,dc=cloud,dc=example -W \
  "(objectClass=organizationalUnit)"

```