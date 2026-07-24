a

### Repositories/Plugins involved for Gardener authentications 
1. https://github.com/int128/kubelogin
2. 

#### TODOs
Lab ? https://github.com/gardener/documentation/blob/docs-2.0/website/documentation/guides/administer-shoots/oidc-login.md#configure-an-identity-provider 
https://auth0.com/pricing 

#### LLM generated authentication flow
```
                +----------------------+
                |      kubectl         |
                +----------+-----------+
                           |
                      ① kubectl get pods
                           |
                           v
                +----------------------+
                | kubeconfig           |
                | exec plugin          |
                +----------+-----------+
                           |
                     ② OIDC Login
                           |
                           v
          +--------------------------------+
          | Identity Provider (IdP)         |
          | Azure AD / Keycloak / IAS ...   |
          +--------------------------------+
                           |
                 ③ ID Token (JWT)
                           |
                           v
                +----------------------+
                | Kubernetes API Server|
                +----------+-----------+
                           |
                验证 JWT 签名
                验证 iss/aud/exp
                           |
                           v
                     User = Brian
                     Groups = ...
                           |
                           v
                      Kubernetes RBAC



            kubectl get pods
                    │
                    ▼
           ~/.kube/config (exec)
                    │
                    ▼
             kubelogin 插件
                    │
      ┌─────────────┴─────────────┐
      │                           │
第一次登录                  Token 已缓存
      │                           │
      ▼                           ▼
 浏览器跳转到 IdP              直接读取缓存 Token
 (IAS/Azure AD/Keycloak)
      │
      ▼
 用户认证（密码/MFA）
      │
      ▼
 获得 ID Token（JWT）
      │
      ▼
 Authorization: Bearer <JWT>
      │
      ▼
 Kubernetes API Server
      │
      ├─ 验证 JWT 签名
      ├─ 验证 iss
      ├─ 验证 aud
      ├─ 验证 exp
      │
      ▼
 提取用户和 Groups
      │
      ▼
 Kubernetes RBAC
      │
      ▼
 返回 Pod 列表

```
