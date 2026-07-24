# Gardener Structured Authentication 详解

> 本文聚焦 Gardener Shoot 集群的 **Structured Authentication**：它是什么、issuer 如何理解、
> 何时该启用。通用 OIDC 登录 flow 见同目录 `Kubernetes_Gardener_Authentication_Flow.md`。

## 背景：访问 Shoot 的两种认证路径

Gardener 管理两层集群：**Garden Cluster（管控面）** 管理多个 **Shoot Cluster（业务集群）**。

关键前提：**Kubernetes v1.27 起，Gardener 废弃了 shoot 的静态凭据**，只能用短期凭据：

1. **短期 admin kubeconfig**（默认，最常用）—— x509 客户端证书
2. **Structured Authentication / OIDC** —— 信任外部 JWT/OIDC issuer

## 正常访问 shoot 需要 Structured Authentication 吗？

**不需要。** 日常运维走短期 admin kubeconfig 即可：

```
你 → Garden Cluster → 请求 adminkubeconfig 子资源
   → Gardener 用 shoot CA 现签一份短命客户端证书 → 访问 shoot
```

请求命令示例：

```bash
export SHOOT=mycluster
export NAMESPACE=garden-myproject
cat <<EOF > req.json
{"apiVersion":"authentication.gardener.cloud/v1alpha1","kind":"AdminKubeconfigRequest","spec":{"expirationSeconds":3600}}
EOF
kubectl create --raw \
  "/apis/core.gardener.cloud/v1beta1/namespaces/${NAMESPACE}/shoots/${SHOOT}/adminkubeconfig" \
  -f req.json | jq -r '.status.kubeconfig' | base64 -d > /tmp/shoot-kubeconfig.yaml
```

> 频繁使用建议用 `gardenlogin` / `gardenctl`（封装成 kubectl exec 插件，自动调子资源）。

**结论：Structured Authentication 不是必需品，而是默认证书方式满足不了需求时才启用的高级扩展。**

## Structured Authentication 解决什么问题

给 shoot 的 kube-apiserver 增加"信任外部 JWT/OIDC 签发者"的能力，补默认证书方式的短板：

| 默认 admin kubeconfig（证书）的局限 | Structured Authentication 如何解决 |
|---|---|
| 身份是固定 admin，没有"用户是谁"的概念 | 用外部 IdP 真实身份（email/SA 名），多用户可审计 |
| 每次要 Gardener 现签，不适合 Pod 自动访问 | 工作负载带自己的 SA/OIDC token 直接认证 |
| 无法信任其他集群或外部系统 | 可信任任意 OIDC issuer（别的集群、企业 SSO、CI） |
| 老 `oidcConfig` 只能配一个 issuer，改动需重启 apiserver | 支持多 issuer、声明式 ConfigMap、CEL 表达式 |

## 三类典型使用场景

1. **企业 SSO / 多人团队登录**：团队用 Azure AD / Okta / Dex 登录，按 email 做 RBAC 与审计。
2. **跨集群工作负载身份**：A 集群的 Pod 用自己的 SA token 直接访问 B 集群 API，无需预置 secret。
3. **CI/CD 免密访问**：GitHub Actions / GitLab CI 用 workload identity token 访问 shoot，不存长期 kubeconfig。

## 决策速查表

```
你要访问 shoot：
1. 我（运维）临时/日常操作？        → 短期 admin kubeconfig，不需要 structured auth
2. 团队用企业账号登录、按人审计？   → 需要 structured authentication（对接企业 IdP）
3. Pod / 别的集群 / CI 自动访问？   → 需要 structured authentication（信任对应 issuer）
```

## 配置示例：跨集群工作负载身份

Shoot spec 引用一个 AuthenticationConfiguration ConfigMap：

```yaml
apiVersion: core.gardener.cloud/v1beta1
kind: Shoot
spec:
  kubernetes:
    kubeAPIServer:
      structuredAuthentication:
        configMapName: plato-authentication-config
```

ConfigMap 内容（真实案例：canary 的 `bohr` 集群信任 live 的 PLATO 集群）：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: plato-authentication-config
  namespace: garden-sni
data:
  config.yaml: |
    apiVersion: apiserver.config.k8s.io/v1beta1
    kind: AuthenticationConfiguration
    jwt:
      - issuer:
          url: https://discovery.ingress.garden.live.k8s.ondemand.com/projects/cis/shoots/<UID>/issuer
          audiences:
            - kubernetes
          audienceMatchPolicy: MatchAny
        claimMappings:
          username:
            claim: "sub"
            prefix: ""
```

### 字段逐项解读

| 字段 | 含义 |
|---|---|
| `apiVersion: apiserver.config.k8s.io/v1beta1` | K8s Structured Authentication API，比老 `--oidc-*` flag 灵活，支持多 issuer |
| `jwt[]` | 可配多个 issuer（老 oidcConfig 只能一个） |
| `issuer.url` | 信任的签发者；apiserver 去这里拉 JWKS 公钥验签 |
| `audiences: [kubernetes]` | token 的 `aud` 必须包含此值，防止 token 混用 |
| `audienceMatchPolicy: MatchAny` | aud 命中列表任意一个即可 |
| `claimMappings.username.claim: sub` | 用 JWT 的 `sub` 作为 K8s 用户名（SA token 通常是 `system:serviceaccount:<ns>:<name>`） |
| `prefix: ""` | 显式空串 = 不加前缀（与"不写"语义不同，是刻意为之） |

## 什么是 issuer？

**issuer（签发者）= "谁签发了这个 token，我该信任谁"。** 它是一个可访问的 OIDC discovery 端点。

OIDC/JWT 的信任模型：

```
某个身份系统（IdP）  ──签发──>  JWT Token  ──携带──>  访问 kube-apiserver
        │                         │ 里面写着                    │
        │                         │ iss: <issuer_url>           │ 验证：
        │                         │ sub: <用户/SA 身份>          │ 1. iss 是否在我信任的 issuer 列表里？
        │                         │ aud: <token 给谁用的>        │ 2. 签名是否能被该 issuer 的公钥验证？
        │                         │ exp: <过期时间>              │ 3. aud 是否匹配？
        ▼                                                       ▼
   issuer 就是这个 IdP 的"身份地址"                        全部通过 → 认证成功（再走 RBAC 授权）
```

**关键：issuer 是一个 URL，但它不只是个名字标签，而是一个可访问的 OIDC discovery 端点。** apiserver 会去访问：

```
<issuer_url>/.well-known/openid-configuration   # 拿到 OIDC 元数据
<issuer_url>/keys（或 jwks_uri）                  # 拿到验证签名用的公钥 (JWKS)
```

拿到公钥后，apiserver 就能验证"这个 token 的签名确实来自这个 issuer"，而不是伪造的。

### issuer URL 结构（Gardener Managed SA Issuer）

```
https://discovery.ingress.garden.live.k8s.ondemand.com/projects/cis/shoots/7a04880a-.../issuer
                                                        └─project─┘      └──shoot UID──┘
```

这**不是 Auth0/Okta 那种"人类用户 SSO"，而是另一个 Kubernetes 集群本身充当 issuer**。

这是 Gardener 的 **Managed Service Account Issuer / Workload Identity** 机制：每个 Shoot 集群的 kube-apiserver 都能作为一个 OIDC issuer，对外暴露它签发的 **ServiceAccount token（Projected SA Token）**。URL 里的 `projects/cis/shoots/<UID>` 就精确指向了 PLATO 项目下某个具体的 shoot 集群。

所以这份配置的真实含义是：

> **让 canary 的 `bohr` 集群信任 PLATO 那几个 live 集群里的 ServiceAccount。**
> PLATO 集群里的某个 Pod（带着自己的 SA token）可以直接拿这个 token 来认证访问 `bohr` 的 apiserver——**不需要 bohr 里预先创建任何用户或 secret**。

这就是典型的**跨集群工作负载身份（cross-cluster workload identity）**：一个集群的工作负载去访问另一个集群的 API。

## 跨集群工作负载身份：认证与验证机制详解

### 一句话本质

一个集群（**签发方**，如 PLATO）里的工作负载，用它自己的 **ServiceAccount token / Workload Identity token**，
去认证访问**另一个集群**（**被访问方**，如 bohr）的 API——全程无静态密码、无预置 secret。

### 核心：token 靠"签名 + 公钥"验证，不靠共享密钥

跨集群信任的关键是**非对称签名**：
- 签发方用**私钥**签发 JWT（私钥永不外泄）。
- 被访问方用签发方公开的**公钥（JWKS）**验签。
- 双方不需要共享任何密码，只需被访问方能拉到签发方的公钥。

这就是为什么 issuer 必须是一个**公开可访问的 discovery 端点**——公钥就挂在那里。

### 完整认证流程（以 PLATO Pod 访问 bohr 为例）

```
【签发阶段 — 在 PLATO 集群】
  Pod 挂载 projected SA token
     │  kubelet 向 PLATO apiserver 请求，指定 audience=kubernetes
     ▼
  PLATO apiserver 用自己的私钥签发 JWT：
     iss = https://discovery.../shoots/<PLATO-UID>/issuer
     sub = system:serviceaccount:<ns>:<name>（或 gardener workloadIdentity 身份）
     aud = kubernetes
     exp = 短过期（自动轮转）
     │
【携带 token 跨集群请求】
     │  Pod 拿这个 token 请求 bohr 的 apiserver（Bearer token）
     ▼
【验证阶段 — 在 bohr 集群】
  bohr apiserver 收到 token，按 structuredAuthentication 配置：
     ① 读 token 的 iss → 是否在信任的 issuer 列表里？（是 = PLATO issuer）
     ② 访问 <iss>/.well-known/openid-configuration → 拿到 jwks_uri
     ③ 从 jwks_uri 拉 PLATO 的公钥 → 验证 JWT 签名（确认确实是 PLATO 私钥签的，未被篡改）
     ④ 校验 aud 是否包含 kubernetes（防 token 混用）、exp 是否未过期
     │  全部通过 → 认证成功
     ▼
  按 claimMappings 把 sub 映射成 bohr 里的用户名
     │
【授权阶段 — 仍在 bohr】
  bohr 的 RBAC（ClusterRole/RoleBinding）决定这个用户名能做什么
```

### Gardener 侧的三个关键组件（GEP-0024 Shoot OIDC Issuer）

这套"garden ↔ shoot 互信"能力由三个组件支撑：

| 组件 | 作用 |
|---|---|
| **Managed Service Account Issuer** | 配置签发方 shoot 的 apiserver 用 **Gardener 托管的密钥对**签 SA token；对应的 OIDC discovery 文档和 JWKS 由 **Gardener Discovery Server** 公开托管 |
| **oidc-webhook-authenticator (OWA)** | 部署在 garden 集群的 webhook token 认证器，验证来自受信 issuer 的 OIDC token |
| **garden-shoot-trust-configurator** | 控制器，监听被标注为"受信"的 shoot，自动创建 OWA 消费的 OIDC 自定义资源 |

启用 managed issuer 只需给签发方 shoot 加注解：

```yaml
metadata:
  annotations:
    authentication.gardener.cloud/issuer: managed
```

启用后，Gardener Discovery Server 就会在公开 URL 上托管该 shoot 的 discovery 文档与 JWKS，供任何被访问方验签。

### JWT 里到底有什么（Gardener Workload Identity 示例）

Gardener 签发的 JWT 携带丰富上下文，便于被访问方做精细化 claim 校验：

```json
{
  "aud": "<your-configured-audience>",
  "iss": "https://<gardener-workload-identity-issuer-url>",
  "sub": "gardener.cloud:workloadidentity:<namespace>:<name>:<uid>",
  "gardener.cloud": {
    "workloadIdentity": { "name": "my-infra", "namespace": "garden-myproject", "uid": "..." },
    "shoot":   { "name": "production-1", "namespace": "garden-myproject", "uid": "..." },
    "project": { "name": "myproject", "uid": "..." },
    "seed":    { "name": "eu-seed-1", "uid": "..." }
  }
}
```

被访问方可基于这些 claim（如 shoot 名、project、seed）用 CEL 表达式做更严格的准入判断。

### 关键安全特性

| 特性 | 说明 |
|---|---|
| **无静态凭据** | token 短命且自动轮转，不在任何集群里存长期密码/kubeconfig |
| **非对称信任** | 只暴露公钥，私钥不出签发方；被访问方无法伪造 token |
| **audience 绑定** | `aud` 限定 token 只能用于指定接收方，防止 token 被挪用到别的服务 |
| **单向信任** | 被访问方在自己的信任列表里显式列出 issuer，才建立信任——签发方无法强加 |

> **⚠️ 运维注意**：启用 managed issuer 是**不可逆**的。从 custom/external issuer 切换前，
> 必须先把旧 issuer 加进 `.spec.kubernetes.kubeAPIServer.serviceAccountConfig.acceptedIssuers`，
> 否则已签发的 token 会失效，控制面、系统组件、工作负载 Pod 可能故障。

## issuer 值从哪里获取

| 来源 | 方法 |
|---|---|
| 最权威：签发方 shoot 的 status | `kubectl get shoot <name> -n garden-<proj> -o jsonpath='{.status.advertisedAddresses}'`，找 type=service-account-issuer |
| 客户端核对：discovery 端点 | `curl -s <issuer>/.well-known/openid-configuration \| jq`，看返回的 `issuer` / `jwks_uri` |
| 从样例 token 反解 | `echo <jwt> \| cut -d. -f2 \| base64 -d \| jq '.iss,.aud,.sub'` |

### 三种来源详解

**来源 1：从签发方 shoot 的 `status` 读（最权威）**

一个 shoot 启用 managed service account issuer 后，Gardener 会把生成好的 issuer URL
写回 shoot 资源的 status。在签发方所在 garden（如 live/cis）执行：

```bash
kubectl get shoot <plato-shoot-name> -n garden-cis \
  -o jsonpath='{.status.advertisedAddresses}' | jq
```

`advertisedAddresses` 里有一条 `type: service-account-issuer` 记录，其 `url` 即该值。
这是集群自己声明的官方 issuer 地址，最该以它为准。

**来源 2：访问 issuer 的 discovery 端点核对（客户端视角）**

任何人（含 apiserver）都能按 OIDC 标准拉元数据：

```bash
curl -s <issuer>/.well-known/openid-configuration | jq
```

返回 JSON 里的 `issuer` 字段必须和 URL 完全一致，`jwks_uri` 指向验签公钥。
apiserver 信任时也是这么做：拿 token → 看 iss → 去 discovery 拉公钥 → 验签。

**来源 3：从 token 本身反解（已有样例 token 时）**

```bash
echo "<jwt>" | cut -d. -f2 | base64 -d 2>/dev/null | jq '.iss, .aud, .sub'
```

`iss` 即 issuer，`aud` 对应配置里的 `audiences`，`sub` 对应 `claimMappings.username.claim`。
三者必须和 `AuthenticationConfiguration` 对得上，认证才通过。

启用来源（签发方 shoot spec）：

```yaml
spec:
  kubernetes:
    kubeAPIServer:
      serviceAccountConfig:
        issuer: https://discovery.ingress.garden.live.k8s.ondemand.com/projects/cis/shoots/<UID>/issuer
```

### bohr 侧这个值是怎么来的（对接契约）

对被访问方（bohr / SNI 团队）而言，这个值是从签发方（PLATO 团队）作为对接契约拿到的：

```
PLATO 团队（身份提供方）
   │ 1. 在 live/cis 下给自己的 shoot 开启 managed SA issuer
   │ 2. 从 shoot.status.advertisedAddresses 拿到 issuer URL
   │ 3. 把 issuer URL + audiences + sub 声明，作为"接入信息"给 SNI 团队
   ▼
SNI 团队（被访问方，bohr owner）
   │ 4. 把 URL 写进 plato-authentication-config ConfigMap
   │ 5. kubectl apply 到 canary/garden-sni
   ▼
bohr apiserver 开始信任 PLATO 的 token
```

ConfigMap 注释 `# Allow PLATO ... cluster to be trusted` 正印证这是一次有意的、跨团队的信任接入。

> **URL 里的 UUID 是什么**：签发方 shoot 的 `metadata.uid`（身份唯一标识），所以是一串 UUID 而非名字——shoot 改名不影响这个 issuer 地址。

## 为什么 canary 集群会信任一个 live 的 issuer？

通常我们期望 canary 只信任 canary。这里是有意为之，原因是：

**1. issuer 指向的是"身份来源"，不是"部署环境"。**
`.garden.live.k8s.ondemand.com` 这个域名说明 PLATO 这套系统本身部署在 **live** landscape。PLATO 是身份的**提供方**（谁来访问 bohr），而 bohr 是**被访问方**。被访问方在哪个 landscape，和它信任谁，是两件独立的事。

**2. PLATO 只有一套（生产），没有 canary 副本。**
注释写得很清楚：`prod-beta`、`prod`、`prod-dr`——这些都是 PLATO 的**生产**集群（prod + 灾备 prod-dr）。PLATO 作为一个平台服务，它的身份签发端点就固定在 live。无论谁想让 PLATO 的工作负载访问自己，都得信任这几个 live issuer——canary 集群也不例外。

**3. 这是"canary 集群被 live 的 PLATO 平台纳管/访问"的场景。**
合理的推断：`bohr` 是被 PLATO 平台管理或对接的目标集群。PLATO（跑在 live）需要用它自己的 SA 身份去操作 bohr，所以 bohr 必须把 PLATO 的 live issuer 加进信任列表。**方向是 live → canary（PLATO 访问 bohr）**，不是 canary 依赖 live 做自己的认证。

一句话总结：**issuer 的 landscape 反映的是"访问者（PLATO）住在哪"，而不是"被访问集群（bohr）住在哪"。跨 landscape 是这个平台对接场景的正常现象。**

## 认证之后仍需授权（RBAC）

Structured Authentication 只解决 **AuthN（你是谁）**：token 验过后被识别成一个用户名（`sub` 的值）。
它能做什么由目标 shoot 内部的 **RBAC**（ClusterRole / RoleBinding）决定。否则"认证成功但无权操作"。

## 实操：巡检哪些 shoot 启用了 Structured Authentication

```bash
kubectl get shoots -n garden-<proj> -o custom-columns=\
'NAME:.metadata.name,K8S:.spec.kubernetes.version,STRUCTURED_AUTH:.spec.kubernetes.kubeAPIServer.structuredAuthentication.configMapName,OIDC_LEGACY:.spec.kubernetes.kubeAPIServer.oidcConfig.clientID'
```

> 观察经验（canary/sni）：多数业务/验证集群不配 structured auth（走 admin kubeconfig 即正常）；
> 只有需要被外部平台工作负载访问的集群（如 bohr 被 PLATO 访问）才启用。分布"少数启用、多数未启用"是正常且正确的。


