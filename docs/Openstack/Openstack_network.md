
#### Share an external Network to a project 

https://operations.global.cloud.pppdemands.com/docs/support/playbook/neutron/add-external-network/

Manage Scenario 1: Add DEV_TEAM_private_sandbox as __shared network__ to specific project

Catalog:
- Project ID: PROJECT-ID-PLACEHOLDER
- DEV_TEAM_private_sandbox Network ID: 00000000-0000-4000-8000-000000000001

```
openstack network rbac list
# You can navigate rbac policy ID from above command
| 00000000-0000-4000-8000-000000000002 | network     | 00000000-0000-4000-8000-000000000001 |

```


```
USER001 @ eu-nl-1 > cloudtenant01 > DEV_TEAM > openstack network rbac create --target-project PROJECT-ID-PLACEHOLDER --action access_as_shared --type network 00000000-0000-4000-8000-000000000001
+-------------------+--------------------------------------+
| Field             | Value                                |
+-------------------+--------------------------------------+
| action            | access_as_shared                     |
| id                | 00000000-0000-4000-8000-000000000003 |   --> this is the rbac policy ID
| object_id         | 00000000-0000-4000-8000-000000000001 |
| object_type       | network                              |
| project_id        | PROJECT-ID-PLACEHOLDER     |
| target_project_id | PROJECT-ID-PLACEHOLDER     |
+-------------------+--------------------------------------+
```


```
USER001 @ eu-nl-1 > cloudtenant01 > DEV_TEAM > openstack network show 00000000-0000-4000-8000-000000000001
+---------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Field                     | Value                                                                                                                                                                           |
+---------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| admin_state_up            | UP                                                                                                                                                                              |
| availability_zone_hints   |                                                                                                                                                                                 |
| availability_zones        | eu-nl-1a, eu-nl-1b                                                                                                                                                              |
| created_at                | 2023-01-13T05:00:30Z                                                                                                                                                            |
| description               |                                                                                                                                                                                 |
| dns_domain                |                                                                                                                                                                                 |
| id                        | 00000000-0000-4000-8000-000000000001                                                                                                                                            |
| ipv4_address_scope        | None                                                                                                                                                                            |
| ipv6_address_scope        | None                                                                                                                                                                            |
| is_default                | None                                                                                                                                                                            |
| is_vlan_transparent       | None                                                                                                                                                                            |
| mtu                       | 8950                                                                                                                                                                            |
| name                      | DEV_TEAM_private_sandbox                                                                                                                                                       |
| port_security_enabled     | False                                                                                                                                                                           |
| project_id                | PROJECT-ID-PLACEHOLDER                                                                                                                                                |
| provider:network_type     | None                                                                                                                                                                            |
| provider:physical_network | None                                                                                                                                                                            |
| provider:segmentation_id  | None                                                                                                                                                                            |
| qos_policy_id             | None                                                                                                                                                                            |
| revision_number           | 6                                                                                                                                                                               |
| router:external           | Internal                                                                                                                                                                        |
| segments                  | [{'provider:network_type': 'vxlan', 'provider:physical_network': None, 'provider:segmentation_id': 10247}, {'provider:network_type': 'vlan', 'provider:physical_network':       |
|                           | 'ap010', 'provider:segmentation_id': 2791}, {'provider:network_type': 'vlan', 'provider:physical_network': 'np019-np020', 'provider:segmentation_id': 2441},                    |
|                           | {'provider:network_type': 'vlan', 'provider:physical_network': 'bb248', 'provider:segmentation_id': 2039}, {'provider:network_type': 'vlan', 'provider:physical_network':       |
|                           | 'ap009', 'provider:segmentation_id': 2723}, {'provider:network_type': 'vlan', 'provider:physical_network': 'bb247', 'provider:segmentation_id': 2255}]                          |
| shared                    | False                                                                                                                                                                           |
| status                    | ACTIVE                                                                                                                                                                          |
| subnets                   | 00000000-0000-4000-8000-000000000004                                                                                                                                            |
| tags                      | cloudtenant01::aci::tenant::cc-openstack-eu-nl-1-1                                                                                                                                   |
| updated_at                | 2023-04-19T02:16:34Z                                                                                                                                                            |
+---------------------------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

# network rbac cleanup
`openstack network rbac delete 00000000-0000-4000-8000-000000000002`
```


#### C Cloud ASN 

Calculate: &lt;REGION_ASN&gt; * 65536 + 4
The route-target value generated from 4-byte dotted representation of region's ASn by formula: (&lt;REGION_ASN&gt; * 65536 + 4):&lt;UNIQUE_ID&gt;. In this example 65130.4:2000 converted to 4268359684:2000
https://netbox.global.cloud.pppdemands.com/ipam/asns/


#### RT&lt;-&gt;CIS Conn, import/export targets check

```
USER001 @ eu-de-1 > env-a > svc-a-eu-de-1-tools > os bgpvpn show  00000000-0000-4000-8000-000000000005
+----------------------+------------------------------------------------------------------------------------------------------------------+
| Field                | Value                                                                                                            |
+----------------------+------------------------------------------------------------------------------------------------------------------+
| export_targets       | 4267048964:2000                                                                                                  |
| id                   | 00000000-0000-4000-8000-000000000005                                                                             |
| import_targets       | 4267048964:2000                                                                                                  |
| local_pref           | None                                                                                                             |
| name                 | plat-a-eu-de-1-env-a-spc-tic                                                                                          |
| networks             |                                                                                                                  |
| ports                |                                                                                                                  |
| project_id           | PROJECT-ID-PLACEHOLDER                                                                                 |
| route_distinguishers |                                                                                                                  |
| route_targets        |                                                                                                                  |
| routers              | 00000000-0000-4000-8000-000000000006, 00000000-0000-4000-8000-000000000007, 00000000-0000-4000-8000-000000000008 |
| shared               | True                                                                                                             |
| type                 | l3                                                                                                               |
| vni                  | None                                                                                                             |
+----------------------+------------------------------------------------------------------------------------------------------------------+

Target values explanation/intruction: 
https://operations.global.cloud.pppdemands.com/docs/operation/network/bgpvpn_troubleshooting/


```


#### SVC-A ENV-A BPGVPN Design 

From CIS BPGVPN plat-a-eu-de-1-env-a-spc-tic's Access Control. Add Policy "access as shared" to the following projects (as Target projects). 
Then the BGPVPN will present as the shared BGPVPN in those projects ??

Project ID: PROJECT-ID-PLACEHOLDER  EUDE1 Tools
Project ID: PROJECT-ID-PLACEHOLDER  EUDE1 Prod

From OADEV, you must add new project ID as target project ID also.


#### HOWTO: configure router to use external network
```
openstack router set --external-gateway <external network ID> <Shoot-router-ID> 

e.g. openstack router set --external-gateway 00000000-0000-4000-8000-000000000009 00000000-0000-4000-8000-00000000000a 
```

##### Share bgpvpn 
`openstack network rbac create --type router --target-project <other-project-id> --action access_as_shared <router-id>`
