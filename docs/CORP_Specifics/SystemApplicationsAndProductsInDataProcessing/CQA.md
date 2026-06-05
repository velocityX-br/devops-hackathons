

```
https://wiki.one.int.sap/wiki/spaces/CIEA/pages/2290281135/Query+API+for+Inventory+Search

curl -X POST -u a:b -d 'obj_organization=GCS%20SIDevOps&dns_zones=testing.gmp.eu-de-2.cloud.sap' 'https://gmp.cia.net.sap/cgi-bin/rest/rest.pl/SelfService/Update%20DNS%20Zones/execute'

curl -X POST -u a:b \
'https://gmp.cia.net.sap/cgi-bin/rest/rest.pl/SelfService/query/13FCDA365B6311F18D27F5479F57F669'


curl -X POST -u iaa1:Ideaaa## \
'https://gmp.cia.net.sap/cgi-bin/rest/rest.pl/cqa/v1/query/attributes/?query=DnsZones.with(name%20in%20(%22ryd1.od.sap.biz%22%2C%22sha3.od.sap.biz%22))&attributes=name&attributes=ips&attributes=aliases_count&attributes=ips_count?type=json'


curl https://tic.cia.net.sap/cgi-bin/rest/rest.pl/cqa/v1/query/status?requestId=3B81E90E6CA411EDB9C59CE2C471D6E7 -u <user>



DNS Specifics

```
DnsNameservers.with(name in ("dns-api Hidden Primary"))
DnsZones.with(name in ("ryd1.od.sap.biz","sha3.od.sap.biz","spa3.od.sap.biz"))

dns-api dig global @0 axfr sha3.od.sap.biz |grep -E "IN[[:space:]]+A" |less

❯ curl -s -u aaa1:Ideaaa## \
  'https://gmp.cia.net.sap/cgi-bin/rest/rest.pl/cqa/v1/query/attributes/?query=DnsZones.with(name%20in%20(%22ryd1.od.sap.biz%22%2C%22sha3.od.sap.biz%22%2C%22spa3.od.sap.biz%22))&attributes=name&attributes=aliases_count&attributes=ips_count' | jq .
{
  "DnsZone": {
    "spa3.od.sap.biz": {
      "aliases_count": 58,
      "name": "spa3.od.sap.biz",
      "ips_count": 2630
    },
    "ryd1.od.sap.biz": {
      "aliases_count": 47,
      "name": "ryd1.od.sap.biz",
      "ips_count": 2827
    },
    "sha3.od.sap.biz": {
      "name": "sha3.od.sap.biz",
      "ips_count": 2187,
      "aliases_count": 59
    }
  }
}

```


## 获取所有有效 CQA Type Name 的方法

### 方法 1:查看源码 — 完整列表(最权威)

所有 CQA inventory 类型都定义在这个文件:

📄 **[cgi-bin/lib/GMP/CQA/TypeEngine/Inventory.pm#L16-L112](https://github.tools.sap/cia-web-services/gmp-app/blob/main/cgi-bin/lib/GMP/CQA/TypeEngine/Inventory.pm#L16-L112)**

格式 `Singular(s)` 表示既支持单数又支持复数,例如:
- `VirtualMachine(s)` → `VirtualMachine` 或 `VirtualMachines`
- `DnsZone(s)` → `DnsZone` 或 `DnsZones`
- `VmPool|VmPools` (用 `|`) → 单复数不规则时显式列出

### 方法 2:在 CQA UI 自查

打开 GMP 的 CQA 查询页面:

🔗 https://gmp.cia.net.sap/cgi-bin/objects.pl/CQA/

直接输入 `Help` 或者错误的类型名(像你之前那样),错误信息和补全提示会列出可用的 type。

### 方法 3:常用类型速查表

| 分类 | Type Names |
|------|-----------|
| **Compute** | `VirtualMachine`, `VmPool`, `Hypervisor`, `BladeServer`, `BladeFrame` |
| **Storage** | `Storage`, `Volume`, `BlockDevice`, `LUN`, `Aggregate`, `VFiler`, `Mountpoint` |
| **Network/DNS** | `DnsZone`, `DnsHost`, `DnsAlias`, `DnsMailExchanger`, `DnsNameserver`, `DnsRange`, `DnsTXTRecord`, `DnsNetwork`, `DNSHostV6` |
| **Load Balancing** | `LoadBalancer`, `LoadBalancerCluster`, `LoadBalancerPool`, `LoadBalancerVirtualServer`, `LoadBalancerHealthCheck`, `LoadBalancerDataGroup`, `CloudLB`, `CloudLBListener`, `CloudLBServiceGroup`, `CloudLBHealthCheck` |
| **Cloud** | `CloudProvider`, `CloudFrameManager`, `CloudFrameFrame`, `CloudFrameNode`, `NatRule`, `NatGateway`, `SecurityGroup`, `SecurityRule`, `CloudEncryptionKey` |
| **K8s** | `K8SCluster`, `K8SNode`, `K8SWorkerGroup`, `K8SApplication`, `GardenerProject` |
| **Business** | `Customer`, `Tenant`, `Project`, `Landscape`, `System`, `SapInstance`, `Database`, `BusinessSystemType`, `UsageArea` |
| **Certificate** | `Certificate`, `CertificateContainer`, `CertificateLocation` |
| **DR/Backup** | `DrScenario`, `DrScenarioRelation`, `Backup`, `BackupServer` |
| **Image/Provisioning** | `Image`, `ImageVersion`, `ImageCustomization`, `ChefServer`, `AnsibleServer` |
| **Webdispatcher** | `WebdispatcherCluster`, `WebdispatcherNode`, `WebdispatcherVirtualhost`, `WebdispatcherDomainMapping` |
| **Other** | `NIC`, `AccessGroup`, `HwPool`, `ResourcePool`, `StorageNode`, `StorageInterface`, `PacemakerCluster`, `LogicalVolumeManager`, `BillingData`, `CronusRecipient`, `CronusForwarding`, `CustomerConnection`, `CustomerConnectionGateway`, `HardwareSecurityModule`, `ServiceProviderCockpit` |

### 提示

- **大小写敏感**:`DNSZones`(全大写 DNS) ≠ `DnsZones`(只有 D 大写)
- **API 名 ≠ 数据库表名**:CQA 用的是 `API_NAME`,与 inventory 内部 component name 可能不同
- **版本相关**:某些类型在不同 API 版本下有效性不同(`resolve_versioned_identifier`)