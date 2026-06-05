

Migration scripts:
```
set -euo pipefail

cd "$(dirname "$0")"

BACKUPDIR="backup"

if systemctl is-active named; then
   SERVER="Active"
else
   SERVER="Backup"
fi

echo "Executing ${0} on ${HOSTNAME} dns-api server in $(pwd)."

#echo "remove this and the exit before the change"
#exit 1


if [[ ! -f "/var/lib/named/dns-api/rfc2136-global-keys.conf" ]]; then
       umask 0337
       tsig-keygen -a hmac-sha512 "rfc2136-0-global" > "/var/lib/named/dns-api/rfc2136-global-keys.conf"
       chown root:named /var/lib/named/dns-api/rfc2136-global-keys.conf
fi

cp --preserve=mode,timestamps -v rfc2136-update-policy.conf /var/lib/named/dns-api/rfc2136-update-policy.conf
chown root:named /var/lib/named/dns-api/rfc2136-update-policy.conf

#echo "remove this and the exit before the change"
#exit 1

if [ ! -d ${BACKUPDIR}/${HOSTNAME} ]; then mkdir -p ${BACKUPDIR}/${HOSTNAME}; fi

if [ ! -f ${BACKUPDIR}/${HOSTNAME}/Zone.pm ]; then
        cp -pv /usr/lib/perl5/vendor_perl/5.18.2/DNS/API/Zone.pm ${BACKUPDIR}/${HOSTNAME}/Zone.pm
fi
if [ ! -f ${BACKUPDIR}/${HOSTNAME}/named.conf.include.tt ]; then
        cp -pv /var/lib/dns-api/templates/hiddenmaster/named.conf.include.tt ${BACKUPDIR}/${HOSTNAME}/named.conf.include.tt
fi
cp --preserve=mode,timestamps -v Zone.pm /usr/lib/perl5/vendor_perl/5.18.2/DNS/API/Zone.pm
cp --preserve=mode,timestamps -v named.conf.include.tt /var/lib/dns-api/templates/hiddenmaster/named.conf.include.tt
chown root:root /usr/lib/perl5/vendor_perl/5.18.2/DNS/API/Zone.pm /var/lib/dns-api/templates/hiddenmaster/named.conf.include.tt

if [ "${SERVER}" == "Active" ]; then
        if [ ! -f ${BACKUPDIR}/global.nzf ]; then
                cp -pv /var/lib/named/global.nzf ${BACKUPDIR}/global.nzf
        fi

        for zone in $(dns-api zone list global | grep -v "\.arpa$"); do
                dns-api -f zone add global "${zone}"
                sleep 0.1
        done
        diff ${BACKUPDIR}/global.nzf /var/lib/named/global.nzf
```