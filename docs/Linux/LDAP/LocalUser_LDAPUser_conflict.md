****Issue description****: 
SVC-A found there same one user having two different UIDs. 
One locally in OS / another one in LDAP.  --> 本地 uid=502(wvtadm) LDAP uidNumber: 100000013


****Solution****:
1. Check /etc/passwd on which user will be used first. Local one or LDAP one
2. Check file descriptors using by the problematic user. 
3. Check if the local generated UID exist in LDAP
4. There are two options - a. LOB directly switch to LDAP UID `chown -R --from=oldUID newUID /`  b. Sync LDAP uid the same as local (the one process being used)  
Found file 

****Analysis****:
> stat /usr/example/WVT/W80/exe/pppstartsrv
  File: /usr/example/WVT/W80/exe/pppstartsrv
  Size: 15763192        Blocks: 30792      IO Block: 4096   regular file
Device: fe05h/65029d    Inode: 131802      Links: 1
Access: (0755/-rwxr-xr-x)  Uid: (  502/  wvtadm)   Gid: (   79/  pppsys)

ldapsearch -ZZ -LLL -H ldap://ldap-eude2-spc.env-a-spc-tic.plat-a.eu-de-2.cloud.pppdemands.com -b dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example -D cn=slave,ou=users,ou=SYS,dc=env-a-spc-tic,dc=plat-a,dc=eu-de-2,dc=cloud,dc=example -W \
  "(&(uidNumber=502))"
Enter LDAP Password:

> ps -u wvtadm
  PID TTY          TIME CMD
9028 ?        00:04:16 pppstartsrv
9167 ?        00:00:00 pppstart
9176 ?        00:11:04 wd.pppWVT_W80
(vawd01wvt) USER001@vm-host001:/etc/openldap>
> ps -ef | grep 9028
wvtadm    9028     1  0 Oct11 ?        00:04:16 /usr/example/WVT/W80/exe/pppstartsrv pf=/usr/example/WVT/SYS/profile/WVT_W80_vawd01wvt -D -u wvtadm