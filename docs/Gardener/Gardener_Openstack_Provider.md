:::tip Shoot Cluster Manifest Tips

Shoot Cluster Level Manifest - Bibble of running Gardener on topic of ppp Cloud Infrastructure - ConvergedCloud (Gardener Provider: Openstack)
:::

High Availability


### Shoot cluster Enable soft-anti-affinity
Read [serverGroup soft-anti-affinity](https://github.com/gardener/gardener-extension-provider-openstack/blob/master/docs/usage/usage.md#servergroups)
```jsx
spec:
  [...]
  kubernetes:
    workers:
      - [...]
        providerConfig:
          apiVersion: openstack.provider.extensions.gardener.cloud/v1alpha1
          kind: WorkerConfig
          serverGroup:
            policy: soft-anti-affinity

# Validation 
openstack server show vsa-host001/<worker nodes> -c OS-EXT-SRV-ATTR:host

策略定义：soft-anti-affinity 是OpenStack服务器组（server group）的一种调度策略，表示尽量将实例分散到不同物理主机，但在资源不足时允许部分实例共存于同一主机 

这里的“实例”特指 Gardener 通过 OpenStack 创建的 Worker 节点虚拟机。soft-anti-affinity 策略通过 OpenStack Nova 调度器，控制这些虚拟机在物理主机上的分布，以实现高可用性与资源利用率的平衡
```


### Shoot Cluster Enable Manila Share 
How to design multiAZ PV/PVC. In statefulset as workload ?
what if the PVC/PV got destroyed ?
how the second pod got started up or high availability ?

```
spec→ provider→ controlPlaneConfig → storage → csiManila → enabled→ true

looks like this:

  provider:
    type: openstack
    controlPlaneConfig:
      apiVersion: openstack.provider.extensions.gardener.cloud/v1alpha1
      kind: ControlPlaneConfig
      loadBalancerProvider: f5
      storage:
        csiManila:
          enabled: true

spec→ provider→infrastructureConfig → networks → shareNetwork → enabled→ true

looks like:

    infrastructureConfig:
      apiVersion: openstack.provider.extensions.gardener.cloud/v1alpha1
      floatingPoolName: FloatingIP-external-cloudtenant01-02
      kind: InfrastructureConfig
      networks:
        router:
          id: 00000000-0000-4000-8000-000000000001
        workers: 10.0.0.1/16
        shareNetwork:
          enabled: true
```

Question:
Worker notes AZ should be matching to `Manila AZ ? Compute AZ (zone-1) = Manila AZ (Zone-1)`
https://github.com/kubernetes/cloud-provider-openstack/blob/master/docs/manila-csi-plugin/using-manila-csi-plugin.md

https://github.tools.pppdemands.com/sdo-toolsandutilities/gardener-addons

### Shoot Cluster Enable DNS provider - Openstack designate

https://gardener.cloud/docs/extensions/others/gardener-extension-shoot-dns-service/dns_providers/

```
kind: Shoot
apiVersion: core.gardener.cloud/v1beta1
metadata:
  [...]
  labels:
    dnsrecord.extensions.gardener.cloud/openstack-designate: 'true'
spec:
  [...]
  dns:
    domain: prod-1.cia.net.pppdemands.com
    providers:
      - domains:
          include:
            - cia.net.pppdemands.com
        primary: true
        secretName: designate-secret-cia-net-ppp
        type: openstack-designate
  extensions:
    [...]
    - type: shoot-dns-service
      providerConfig:
        apiVersion: service.dns.extensions.gardener.cloud/v1alpha1
        kind: DNSConfig
        providers:
          - domains:
              include:
                - cia.net.pppdemands.com
            secretName: shoot-dns-service-designate-secret-cia-net-ppp
            type: openstack-designate
        syncProvidersFromShootSpecDNS: true

```
:::danger [Take care]
Application Credential configured from Gardener must have dns_master role
:::
 
```
spec:
  addons:
    kubernetesDashboard:
      enabled: false
      authenticationMode: token
    nginxIngress:
      enabled: false
      externalTrafficPolicy: Cluster
  cloudProfileName: converged-cloud-neo
  dns:
    domain: sit.team-b.c.eu-de-1.cloud.pppdemands.com
    providers:
      - domains:
          include:
            - team-b.c.eu-de-1.cloud.pppdemands.com
        primary: true
        secretName: designate-secret-c8s-team-a-int-ppp
        type: openstack-designate
  extensions:
    - type: shoot-dns-service
      providerConfig:
        apiVersion: service.dns.extensions.gardener.cloud/v1alpha1
        kind: DNSConfig
        syncProvidersFromShootSpecDNS: false
        providers:
          - type: openstack-designate
            secretName: shoot-dns-service-designate-secret-c8s-team-a-int-ppp
            domains:
              include:
                - team-b.c.eu-de-1.cloud.pppdemands.com

# Create a CNAME then a DNS record via SVC/Ingress Annotation 
apiVersion: dns.gardener.cloud/v1alpha1
kind: DNSEntry
metadata:
  annotations:
    dns.gardener.cloud/class: garden
  labels:
    argocd.argoproj.io/instance: argocd-config
  name: dns-argo
  namespace: default
spec:
  dnsName: argocd.sit.team-b.c.eu-de-1.cloud.pppdemands.com
  targets:
  - ingress.sit.team-b.c.eu-de-1.cloud.pppdemands.com
  ttl: 600

# Like below, quick sample from CIEA.
apiVersion: v1
kind: Service
metadata:
  annotations:
    dns.gardener.cloud/class: garden
    dns.gardener.cloud/dnsnames: '*.ingress.prod-1.cia.net.pppdemands.com,ingress.prod-1.cia.net.pppdemands.com'
    dns.gardener.cloud/ttl: "600"
    [...]

```

### Shoot Cluster Enable Custom Certificate
https://pages.github.tools.pppdemands.com/kubernetes/gardener/docs/guides/ppp-internal/networking-lb/managed-certs-from-ppp-ca/#configure-a-custom-certificate-issuer

Known limitation: Wildcard requests are not supported as of now by vendor, according to [pppNETCAG2+ACME+Guide](https://wiki.one.int.pppdemands.com/wiki/display/PKI/pppNETCAG2+ACME+Guide)
```jsx title="Configure a custom certificate"
spec:
  ...
  extensions:
    ...
    # should already contain the DNS extension
    - type: shoot-cert-service
      providerConfig:
        apiVersion: service.cert.extensions.gardener.cloud/v1alpha1
        issuers:
          - email: user@example.com
            name: pppca
            server: "https://acme.pki.net.pppdemands.com/pgwy/acme/directory"
            precheckNameservers:
              - ns3.eu-nl-1.cloud.pppdemands.com.
              - ns1.eu-nl-1.cloud.pppdemands.com.
              - ns2.eu-nl-1.cloud.pppdemands.com.

  extensions:
    - type: shoot-cert-service
      providerConfig:
        apiVersion: service.cert.extensions.gardener.cloud/v1alpha1
        issuers:
          - email: dl-team@example.com
            name: pppca
            precheckNameservers:
              - ns1.eu-de-1.cloud.pppdemands.com.
              - ns2.eu-de-1.cloud.pppdemands.com.
              - ns3.eu-de-1.cloud.pppdemands.com.
            server: https://acme.pki.net.pppdemands.com/pgwy/acme/directory

```

### Shoot cluster network criteria - TODO




### Reference - Gardener Openstack Extension Source code or Introduction

https://github.com/gardener/gardener-extension-provider-openstack/blob/master/docs/usage/usage.md#infrastructureconfig


:::danger [Known Limitations]
:::
1. Give a project access to the capacity of all clusters within a region.
https://documentation.global.cloud.pppdemands.com/docs/customer/getting-started/create-a-project/resource-pooling/
2. Openstack network availability zone must be specified in Terraform before deploying kubernetes resources
3. Wildcard requests are not supported as of now by vendor, according to [pppNETCAG2+ACME+Guide](https://wiki.one.int.pppdemands.com/wiki/display/PKI/pppNETCAG2+ACME+Guide)
