
### Concepts
OIDC
OAUTH2
exec 认证 
JWT 

- Kubernetes doesn't have a built-in OpenID Connect(OIDC) identity provider; Instead, it acts as an OIDC Client that integrate with external IDP to authenticate users.
- 

https://github.com/dexidp/dex
https://example.com/redacted

什么是 Kubernetes OIDC
- OIDC（OpenID Connect）是一种建立在 OAuth 2.0 之上的认证协议，使用标准的 ID Token（JWT）来表达用户身份与属性。
- “Kubernetes OIDC”通常指两类场景：
1. 用 OIDC 给 Kubernetes API Server 做用户认证：apiserver 通过配置 OIDC 发行方、客户端ID、可信 CA 等参数，验证来自浏览器/CLI 的 OIDC ID Token，从而识别用户身份与群组，用于 RBAC 授权。
2. 工作负载的 OIDC 身份联邦：Pod/Job 等工作负载使用 OIDC 的受众与声明，与外部云 IAM 或服务进行联邦（例如通过服务账户投射的 OIDC Token访问外部资源），从而实现“无长期密钥”的细粒度访问控制。
什么是 OIDC provider
- OIDC Provider 即实现 OIDC 协议的身份提供商（IdP），负责：
1. 认证用户/实体，并签发 ID Token（以及可选的 Access Token、Refresh Token）
2. 提供 OIDC 发现文档（.well-known/openid-configuration）、JWKS 公钥、授权与令牌端点等
- 在 Kubernetes 语境中：
1. API Server 把某个 OIDC provider 配为“外部认证源”，用它签发的 ID Token 来识别用户身份与群组
2. 工作负载与外部服务的联邦也依赖 OIDC provider 作为可信发行方
- PPP IAS 与 OIDC 的关系
1. PPP Identity Authentication Service（PPP IAS）是 PPP 的云身份认证服务，支持 OIDC 与 SAML 2.0 等标准协议，可作为企业统一 IdP 或“代理 IdP”（与企业 AD/其他 IdP 打通），并向各类应用和平台（包括 Kubernetes）提供标准 OIDC 能力。
2. 因此，PPP IAS 可以作为“OIDC provider”，为 Kubernetes 集群登录与 RBAC、以及与外部资源的联邦访问提供标准的 OIDC Token。

| 技术            | 回答的问题                       | Kubernetes 是否直接使用                             |
| ------------- | --------------------------- | --------------------------------------------- |
| **OAuth 2.0** | **我可以访问什么资源？**（授权）          | 一般不直接用于用户认证                                   |
| **OIDC**      | **我是谁？**（认证）                | **是，Kubernetes 官方推荐的人类用户认证方式**                |
| **JWT**       | **身份或授权信息的载体**（一种 Token 格式） | **OIDC 的 ID Token 通常就是 JWT，Kubernetes 直接验证它** |

```
                    OAuth 2.0
      (规定如何申请和使用 Access Token)
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
  Opaque Access Token                 JWT Access Token
  "7f92ab4c..."                      "eyJhbGciOi..."
  无法自行解析                         可自行解析
  需要查询授权服务器                   本地验证签名即可

                    OIDC
                       │
                       ▼
              ID Token（必须是 JWT）
              包含用户身份信息
```
### Dex
https://dexidp.io/docs/connectors/ldap/ 

```
connectors:
- config:
    clientID: abc
    clientSecret: abc
    hostName: https://example.com/redacted
    orgs:
    - name: EXAMPLE_ORG
      teams:
      - EXAMPLE_TEAM_OWNER
      - EXAMPLE_TEAM_OPERATOR
      - EXAMPLE_TEAM_SME
    redirectURI: https://dex.example.com/callback
  id: github
  name: GitHub
  type: github
- config:
    bindDN: cn=slave,ou=users,ou=SYS,dc=example,dc=com
    bindPW: $dex.ldap.bindpw
    groupSearch:
      baseDN: ou=groups,ou=ADS,dc=example,dc=com
      filter: (objectClass=posixGroup)
      nameAttr: cn
      userMatchers:
      - groupAttr: memberUid
        userAttr: uid
    host: ldap.example.com:636
    rootCAData: <ROOT_CA_BASE64>
    userSearch:
      baseDN: ou=users,ou=ADS,dc=example,dc=com
      emailAttr: mail
      filter: (objectClass=person)
      idAttr: DN
      nameAttr: displayName
      preferredUsernameAttr: cn
      username: uid
    usernamePrompt: Username
  id: ldap
  name: LDAP
  type: ldap
issuer: https://dex.example.com
staticClients:
- id: ArgoCD
  name: ArgoCD
  redirectURIs:
  - https://argocd.example.com/auth/callback
  secret: <CLIENT_SECRET>
- id: grafana
  name: grafana
  redirectURIs:
  - https://grafana.example.com
  secret: <CLIENT_SECRET>
storage:
  type: memory
```

#### Academic Class
Q: 学习理解JWT 尤其是其在kubernetes认证中和hashicorp vault secret operator 中的应用实践？


