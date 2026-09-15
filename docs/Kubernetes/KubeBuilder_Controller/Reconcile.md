Reconcile 的标准流程（你要记住这个模板）

0. 从 API Server 读取对象
1. 判断对象是否存在
2. 读取关联资源（例如：Shoot）
3. 解析业务字段（例如：expiresAt）
4. 判断对象是否被删除
5. 根据是否被删除，分流到 delete 或 reconcile 逻辑
> 以上代码流程为 Reconcile 标准模板，非常通用。

核心范式：Reconcile = 声明式收敛
对外契约只有一个入口：Reconcile(ctx, req)。

思想是：

给定当前世界（CR + Pod + Service），算出期望 BIND 配置，并推到那个状态；失败就 requeue，成功也要可重复。

不是“创建 zone 调一次、改 IP 再调一次”的命令式流水线，而是每次：

读 DNSZone / MultidcDNSCluster / slaves
master applyZone、also-notify、applyZone 到 slaves
写 status（有变化才写）
返回 RequeueAfter 或 error
所以方法拆分是按 “一次收敛里的子步骤”，不是按 REST 动词 CRUD