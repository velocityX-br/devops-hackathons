#### 什么是conntrack (连接跟踪)
Conntrack（Connection Tracking，连接跟踪）是Linux内核网络栈（Netfilter框架）中的一项核心机制。它用于监控、记录和管理网络连接的状态，使内核能够识别属于同一个数据流（Flow）的所有数据包，而不仅仅是将它们视为独立的单个报
- 核心原理
    - 连接记录 (Connection Entry)： 当网络数据包经过Linux服务器时，conntrack会检查它并生成一条包含通信源地址、目的地址、协议类型（如TCP、UDP）、源端口和目的端口等四元组或五元组信息的连接记录。
    - 状态维护： 它维护一个连接跟踪表（Conntrack Table），用于存储这些活跃的连接记录。
    - 双向跟踪： Conntrack不只记录入站数据包，它也会记录对应的出站响应数据包，从而能够跟踪完整双向流量

| 协议   | conntrack 会记录什么         |
| ---- | ----------------------- |
| TCP  | SYN / ESTABLISHED / FIN |
| UDP  | “伪连接”（基于超时）             |
| ICMP | request / reply         |

Q: Why DNS shouldn't traverse conntrack?
A: DNS is high QPS traffic 
DNS 特点：
- UDP
- 短连接（甚至无连接）
- 请求量巨大 
Commands
```
conntrack -L 
nodesh-USER001-lab--sit-pocdev-tmp-worker-ls4lq-z1-85f4f-prr89:/ # conntrack -L -p udp --dport 53

1. 有代表的一行数据分析
udp      17 1 src=10.0.0.1 dst=10.0.0.2 sport=56086 dport=53 packets=1 bytes=112 src=10.0.0.2 dst=10.0.0.1 sport=53 dport=56086 packets=1 bytes=196 mark=0 use=1

2. 定位这里的IP  10.0.0.1 是Node地址
如何定位10.0.0.1 ？ 先定位是否是node VM中的IP， 若不是通过MAC前缀来定位 
nodesh-USER001-lab--sit-pocdev-tmp-worker-ls4lq-z1-85f4f-prr89:/ # ip neigh | grep 10.0.0.2 10.0.0.2 dev ens33 lladdr 02:00:00:00:00:01 REACHABLE

fa:16:3e:xx:xx:xx 这个前缀非常有代表性 这是：OpenStack Neutron（虚拟机网卡）的典型 MAC 前缀

3. 然后返现这是DHCP IP？？
29ad76a7-a972-446...		shoot--lab--sit-pocdev-tmp	
10.0.0.2
shoot--lab--sit-pocdev-tmp
network:dhcp
dhcpe36550aa-b95e...	ACTIVE
在 OpenStack 里，DHCP agent 通常同时提供 DNS 功能
Node 在问 DHCP/DNS（dnsmasq）
```


```
解读下一条基于LB member开放端口检索出的数据
udp      17 10 src=10.0.0.3 dst=10.0.0.1 sport=25693 dport=32202 packets=1 bytes=28 [UNREPLIED] src=10.0.0.4 dst=240.243.13.39 sport=53 dport=22537 packets=0 bytes=0 mark=0 use=1

# 这是一个LB
USER001 @ eu-de-2 > env-a > team-a-dev-k8s > openstack port list --device-owner network:f5selfip |grep 78.104
| 00000000-0000-4000-8000-000000000001 | local-eu-de-2-lb012a-04.cc.eu-de-2.cloud.pppdemands.com-00000000-0000-4000-8000-000000000002      | 02:00:00:00:00:01 | ip_address='10.0.0.3', subnet_id='00000000-0000-4000-8000-000000000002' | ACTIVE |



USER001 @ eu-de-2 > env-a > team-a-dev-k8s > openstack port list --device-owner network:f5selfip | grep 00000000-0000-4000-8000-000000000002
| 00000000-0000-4000-8000-000000000003 | local-eu-de-2-lb013b-02.cc.eu-de-2.cloud.pppdemands.com-00000000-0000-4000-8000-000000000002      | 02:00:00:00:00:01 | ip_address='10.0.0.5', subnet_id='00000000-0000-4000-8000-000000000002'  | ACTIVE |
| 00000000-0000-4000-8000-000000000004 | local-eu-de-2-lb012a-03.cc.eu-de-2.cloud.pppdemands.com-00000000-0000-4000-8000-000000000002      | 02:00:00:00:00:01 | ip_address='10.0.0.6', subnet_id='00000000-0000-4000-8000-000000000002'  | ACTIVE |
| 00000000-0000-4000-8000-000000000001 | local-eu-de-2-lb012a-04.cc.eu-de-2.cloud.pppdemands.com-00000000-0000-4000-8000-000000000002      | 02:00:00:00:00:01 | ip_address='10.0.0.3', subnet_id='00000000-0000-4000-8000-000000000002' | ACTIVE |
| 00000000-0000-4000-8000-000000000005 | local-eu-de-2-lb012b-04.cc.eu-de-2.cloud.pppdemands.com-00000000-0000-4000-8000-000000000002      | 02:00:00:00:00:01 | ip_address='10.0.0.7', subnet_id='00000000-0000-4000-8000-000000000002' | ACTIVE |
| 00000000-0000-4000-8000-000000000006 | local-eu-de-2-lb013a-02.cc.eu-de-2.cloud.pppdemands.com-00000000-0000-4000-8000-000000000002      | 02:00:00:00:00:01 | ip_address='10.0.0.8', subnet_id='00000000-0000-4000-8000-000000000002' | ACTIVE |
| 00000000-0000-4000-8000-000000000007 | local-eu-de-2-lb012b-03.cc.eu-de-2.cloud.pppdemands.com-00000000-0000-4000-8000-000000000002      | 02:00:00:00:00:01 | ip_address='10.0.0.9', subnet_id='00000000-0000-4000-8000-000000000002' | ACTIVE |

结论 在openstack/SCI GUI 定位不了某个Loadbalancer对应的F5设备的port selfip。 在node上去捕捉对应lb member 开放的端口可以看到

OpenStack (Octavia)
  只管理：
    - VIP
    - listener
    - pool

但不记录：
    - VIP 实际落在哪个 F5 device


结论： 每个LB在不指定AZ的情况下会有两个F5 port IP （self ip） 
- local-eu-de-2-lb012a-04.cc.eu-de-2.cloud.pppdemands.com-<UUID>
- local-eu-de-2-lb012b-04.cc.eu-de-2.cloud.pppdemands.com-<UUID>

对应 LB 的所有Pool中 会根据AZ/F5 设备Port IP上来决定指向node的端口，同一个zone/F5下的端口一样。比如有三个Pool，两个F5 device IP，则会有两种node的端口，例如 32202和30248 （30000-33000 FIXME？）
- 端口53 和 端口9119， 端口53  

```

Q: conntrack 有实际作用吗？
A: 有，且十分重要 

👉 没有 conntrack = 纯无状态（stateless）网络
意味着：
- 每个包独立处理
- 系统不知道“这是请求还是响应”
- NAT 无法工作

Q: iptables 配置mark有什么作用
A: iptables 里的 **mark（包标记）**是一个非常“底层但威力很大”的机制，本质上就是： 
> 给数据包打一个“标签（整数）”，让后续网络处理逻辑根据这个标签做不同决策
它本身不改变数据包内容，也不直接决定放行/拒绝，而是：
👉 给后续模块提供“条件依据”


Key to the success!~~!!!!
```
NODE_IP="10.0.0.1"
NODEPORT=32202
LB_IP="10.0.0.10"  ip route get LB_IP (LB Ingress IP)
IFACE="ens33"

# 1) raw: DNS 请求去 pod 网段不走 conntrack
iptables -t raw -A PREROUTING \
  -p udp -d 10.0.0.11/12 --dport 53 \
  -j NOTRACK -m comment --comment S4_DNSVIEW_CC
# 2) mangle: DNS 响应打 mark=1，后续走 table 100
iptables -t mangle -A PREROUTING \
  -p udp -s 10.0.0.11/12 --sport 53 ! -d 10.0.0.11/12 \
  -j MARK --set-mark 1 -m comment --comment S4_DNSVIEW_CC
# 3) nat: DNS 响应做 SNAT 到 NodeIP:NodePort
iptables -t nat -A POSTROUTING \
  -p udp -s 10.0.0.11/12 --sport 53 ! -d 10.0.0.11/12 \
  -j SNAT --to-source ${NODE_IP}:${NODEPORT} \
  -m comment --comment S4_DNSVIEW_CC
# 4) 策略路由：mark=1 的包查表100
ip rule add fwmark 0x1 lookup 100
# 5) 表100默认路由指向 LB/VIP（或你环境指定网关）
ip route replace default via ${LB_IP} dev ${IFACE} table 100

iptables -t raw -L PREROUTING -n -v | rg S4_DNSVIEW_CC
iptables -t mangle -L PREROUTING -n -v | rg S4_DNSVIEW_CC
iptables -t nat -L POSTROUTING -n -v | rg S4_DNSVIEW_CC
ip rule list | rg "fwmark 0x1"
ip route show table 100

现在你可以看到请求源IP为LB IP了！！

```

You must enable dsr from LB ?? Difference between cilium and calico ??
```
  networking:
    type: cilium
    providerConfig:
      loadBalancingMode: dsr
      apiVersion: cilium.networking.extensions.gardener.cloud/v1alpha1
      hubble:
        enabled: true
      kind: NetworkConfig
      overlay:
        enabled: false
      tunnel: geneve
    pods: 10.0.0.11/12
    nodes: 10.0.0.12/24
    services: 10.0.0.13/13
    ipFamilies:
      - IPv4
```