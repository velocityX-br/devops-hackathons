---
slug: K8S-Networking-Model
title: K8S-Networking-Model
authors:
  name: Bryan Chen
  title: Innovation junkie. Linux & Kubernetes obsessed
  url: https://github.com/velocityX-br
  image_url: https://github.com/velocityX-br.png
tags: [CNI, Kubernetes, Cloud-native, ClientIP,]
---

import TrackLink from '@site/src/components/TrackLink';
import PostEngagement from '@site/src/components/PostEngagement';

abc

{/* truncate */}

Networking Model
- Every POD should have an IP Address
- Every POD should be able to communication every other POD in same node
- Every POD should be able to communicate with every other POD on other nodes without NAT


```
ip link add v-net-0 type bridge
ip addr add 10.0.0.1/24 dev v-net-0
ip link set beth-red netns red
ip -n red link set veth-red up
ip netns exec blue ip route add 10.0.0.2/24 via 10.0.0.1

ip link set dev v-net-0 up
ip link add veth-red veth peer name veth-red-br
ip -n red addr add 10.0.0.3 dev veth-red
ip link set veth-red-br master v-net-0
iptables -t nat -A POSTROUTING -s 10.0.0.4/24 -j MASQUERADE
```

<PostEngagement postId="k8s-networking-model" postTitle="K8S-Networking-Model" enableComments />