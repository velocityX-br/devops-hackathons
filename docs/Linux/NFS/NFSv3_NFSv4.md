
NFSv3

Finished Tasks:
- Port conflict issue with Lsyncd - https://jira.tools.pppdemands.com/browse/PROJ-B-11558 

```
ms-env-a-svc-a-eu-de-2-vlab-private-01-01-10-180-240-233.vlab.svc-a.plat-a.eu-de-2.cloud.pppdemands.com:/share_5ed69e0e_6ee1_4cbe_8abb_73e6fe229ebe /hdb/VLY/log nfs        rw,proto=tcp,nolock,nfsvers=3,nodev,nosuid,noexec 0 0
```
nolock 是解决 NFSv3 客户端防火墙问题的最简单方法；
⚠️ 但代价是：文件锁不再跨主机生效！  --> 这解释Hana数据库无法实现HA的关键之一
如果多个客户端同时写同一个文件，无法通过锁协调；
可能导致数据损坏；
仅适用于无并发写、或应用自己处理同步的场景。


Conclusion：
端口 111 必须放行（NFSv3）：因为它是服务发现的“查号台”，挂载第一步就要用。
源端口 1–872 无需安全组配置：因为安全组只控制“目标端口”，源端口由客户端临时选择，防火墙自动处理返回流量。

#### Why NFSv4 can't be used by hana 

In short summary: root_squash enabled from NFS server. 
In NFS v4 with idmapd, the same username@domainname must be recognized by both sides and represent the same UID, or it may be mapped to "nobody".
This is because of a separate common cause:  The concept of "root_squash".  By default, an NFS Server which gets a request from a client machine's root user will "squash" the request and treat it as if it came from user "nobody".  Therefore, after a NFS client's root user creates something, both the NFS client view and the NFS server view would agree that the entity is owned by "nobody".


ppp hana compitability on NFSv4.0 or 4.1 
https://me.pppdemands.com/notes/3055554/E

Solution (don't work due to root_squashing in NFS server side):
https://www.suse.com/support/kb/doc/?id=000017244


#### 为什么 NFSv3 客户端需要出站到端口 111？
核心原因：NFSv3 的挂载过程依赖 rpcbind 服务发现
NFSv3 协议设计上将功能拆分为多个独立的 RPC 服务：

nfsd：处理文件读写（端口 2049）
mountd：处理挂载请求（端口动态分配，如 20048）
lockd、statd：处理文件锁（端口也动态）
但客户端一开始并不知道 mountd 在哪个端口！

🔄 挂载流程（关键步骤）：
客户端执行：
1. 客户端执行 mount -t nfs -o vers=3 server:/share /mnt
2. 客户端主动连接 server:111（TCP/UDP）
→ 这是 rpcbind 服务的固定端口
3. 发送查询：
“程序号 100005（mountd）、版本 3、TCP 的服务在哪个端口？”
4. 服务器的 rpcbind 回复：
“在 20048 端口”
5. 客户端再连接 server:20048，调用 mount 获取文件句柄
6. 后续文件操作走 server:2049
✅ 第 2 步必须能访问 111 端口，否则挂载直接失败！ 

💡 类比：
111 端口 = “查号台”
你不打 114，怎么知道“张三”的电话号码？
同理，不连 111，怎么知道 mountd 的端口？
📌 NFSv4 为什么不需要？
因为 NFSv4 把挂载、文件操作、锁等全部集成到 单一协议，直接连 2049，不再需要“查号台”。 




### Solution of idmapping/root_squash 

https://documentation.global.cloud.pppdemands.com/docs/customer/storage/file-storage/fs-howto/filestore-start-nfsv4/ 