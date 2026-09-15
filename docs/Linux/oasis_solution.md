https://wiki.one.int.pppdemands.com/wiki/spaces/S4CDPublic/pages/2152926533/oasis-ng+services 
https://wiki.one.int.pppdemands.com/wiki/spaces/CIEA/pages/2126031265/OASIS+connection+issues
https://wiki.one.int.pppdemands.com/wiki/spaces/HECOPS/pages/4248189040/Oasis#Oasis-CISServerdeploymentandconfiguration


Test oasis client over oasis gateway
```
# perl -I/opt/imal/oasis-ng/2.1/lib/perl5 -MOASIS -MData::Dumper -e '
>   my $route = shift;
>
>   my $client = OASIS->new({
>       service         => "maintenance",
>       host            => $route,
>       connect_timeout => 10,
>       timeout         => 10,
>   }, qw(:all));
>
>   print Data::Dumper::Dumper($client->status);
> ' '100.114.88.140:8086|100.114.88.63:8086'
$VAR1 = {
          'pid' => 'sagichnicht'
        };

 
>>>>>>>>

use strict;
use warnings;

use lib '/opt/imal/oasis-ng/current/lib/perl5/';
use OASIS;

my $routing_string = shift @ARGV
    or die "Usage: $0 <routing-string>\n";

my $handle = OASIS->new({
    host     => $routing_string,
    service  => 'File',
    certfile => '/opt/imal/oasis-ng/current/etc/oasis/ssl/oasis_non_gmp.cer',
    keyfile  => '/opt/imal/oasis-ng/current/etc/oasis/ssl/oasis_non_gmp.key',
});

my $result = join '', $handle->Exec('echo -n 12345');

die "Unexpected response: $result\n"
    unless $result eq '12345';

print "Oasis connection and command execution succeeded\n";

(dnshm01-sit|dnshm-sit) vsa14793779:~ #
# perl oasis-smoke-test.pl   '100.114.88.140:8086|100.114.88.63:8086'
Oasis connection and command execution succeeded

```