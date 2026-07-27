# OpenStack Application Credential（应用凭据）

> Application Credential 是 OpenStack Keystone 提供的一种**凭据委派机制**——把账户的部分权限"打包"成一对 `ID + Secret`，交给应用/脚本/自动化流程使用，而**无需暴露个人登录凭据（用户名/密码）**。

## 1. 用途

| 用途 | 说明 |
|------|------|
| 避免暴露个人密码 | 应用用 ID+Secret 认证，而非把登录密码写进配置文件 |
| 替代 technical user | 简单场景下比"专门建一个技术用户"更轻量 |
| 代表创建者执行操作 | 换取的 Keystone token 继承创建者当前的 roles，以创建者身份执行 |
| 精细化权限控制 | 可只指定部分 role，或配合 access rules 限制到特定 API |
| 可设定有效期 | `--expiration` 到期自动失效 |

## 2. 与 Keystone 的关系

Application Credential 本身就是 **Keystone 身份服务（Identity Service）的原生特性**。

```
你（用户，持有 role）
      │  在 Keystone 中创建 application credential
      ▼
┌─────────────────────────────┐
│  Keystone (Identity Service) │
│  存储：AC-ID + Secret(hash)   │
│        + 继承的 roles         │
│        + 可选 access rules    │
└─────────────────────────────┘
      ▲               │
      │ ①应用用 AC 认证 │ ②签发 Keystone Token
      │  (v3applicationcredential)
      ▼               ▼
   应用/脚本  ──────►  拿 Token 访问其他 OpenStack 服务
                       (Nova/Neutron/Swift...)
```

- Keystone 负责认证、授权、service catalog；Application Credential 是其子功能。
- 应用用 `--os-auth-type v3applicationcredential` + AC-ID + Secret 认证，Keystone 校验后签发标准 token。
- 签发的 token 继承凭据里配置的 roles 和 restrictions。

## 3. 创建（CLI）

```bash
# 基本：指定 role
openstack application credential create \
  --role compute_admin --role objectstore_admin \
  --expiration '2026-12-31T23:59:59' \
  superdemo

# unrestricted：允许该凭据再创建其他凭据（自动化编排场景）
openstack application credential create \
  --unrestricted \
  --description "Credential management automation" \
  --expiration '2026-12-31T23:59:59' \
  credential-automation
```

> ⚠️ Secret 创建后**不可找回**，必须当场保存。CLI 需 **v3.15.0（Rocky）** 及以上。

### restricted vs unrestricted

| 类型 | 能否再创建凭据 | 场景 |
|------|--------------|------|
| Restricted（默认） | ❌ | 普通应用认证 |
| Unrestricted（`--unrestricted`） | ✅ | 凭据管理类自动化流程 |

## 4. 认证换取 Token

```bash
openstack --os-auth-url https://identity-3.<region>.https://example.com/redacted \
  --os-auth-type v3applicationcredential \
  --os-application-credential-id <credential-id> \
  --os-application-credential-secret <secret> \
  token issue -f value -c id
```

### 应用端环境变量（openrc）

```bash
export OS_AUTH_URL="https://identity-3.<region>.https://example.com/redacted"
export OS_AUTH_TYPE=v3applicationcredential
export OS_APPLICATION_CREDENTIAL_ID=<credential-id>
export OS_APPLICATION_CREDENTIAL_SECRET=<secret>
```

支持的客户端：Terraform OpenStack Provider (v1.15.0+)、Rclone (v1.46+)、Restic (v0.9.5+)、Gophercloud 等。

---

## 5. Fine-Grained Access Control（access rules）

> 自 OpenStack **Train** 起，可给凭据附加 **access rules**，把权限精确到"**某服务的某 API 路径 + 某 HTTP 方法**"，而不只是 role 级别。

### access rule 三要素

| 字段 | 含义 | 示例 |
|------|------|------|
| `service` | 服务类型 | `key-manager`、`object-store` |
| `path` | API 路径 | `/v1/secrets/<secret-id>` |
| `method` | HTTP 方法 | `GET`/`POST`/`PUT`/`DELETE` |

> 用此凭据认证的 client **只能**调用规则里列出的组合，其他 API 一律拒绝——哪怕凭据继承的 role 权限更大（最小权限原则）。

**⚠️ 前提**：SCI 中目前**仅 Barbican（key-manager）与 Swift（object-store）支持 access rules**。Terraform Provider 需 **v1.25.0+**。

### 示例 1：Barbican —— 只允许读取某个 secret

```hcl
resource "openstack_keymanager_secret_v1" "secret_1" {
  algorithm            = "aes"
  bit_length           = 256
  mode                 = "cbc"
  name                 = "mysecret"
  payload_content_type = "text/plain"
  secret_type          = "passphrase"
  payload              = "my very secret payload"
}

resource "openstack_identity_application_credential_v3" "app_cred_1" {
  name  = "one-secret-only"
  roles = ["keymanager_viewer"]

  access_rules {
    path    = "/v1/secrets/${openstack_keymanager_secret_v1.secret_1.id}"
    service = "key-manager"
    method  = "GET"
  }
}

output "openrc" {
  value = <<EOF

export OS_AUTH_URL="https://example.com/redacted"
export OS_AUTH_TYPE=v3applicationcredential
export OS_APPLICATION_CREDENTIAL_ID=${openstack_identity_application_credential_v3.app_cred_1.id}
export OS_APPLICATION_CREDENTIAL_SECRET=${openstack_identity_application_credential_v3.app_cred_1.secret}
EOF
}
```

只读 payload（真正密文内容）时路径加 `/payload`：

```hcl
access_rules {
  path    = "/v1/secrets/${openstack_keymanager_secret_v1.secret_1.id}/payload"
  service = "key-manager"
  method  = "GET"
}
```

### 示例 2：组合多条规则（读 payload + 删除 secret）

```hcl
resource "openstack_identity_application_credential_v3" "app_cred_1" {
  name  = "read-and-delete-secret"
  roles = ["keymanager_viewer"]

  access_rules {
    path    = "/v1/secrets/${openstack_keymanager_secret_v1.secret_1.id}/payload"
    service = "key-manager"
    method  = "GET"
  }
  access_rules {
    path    = "/v1/secrets/${openstack_keymanager_secret_v1.secret_1.id}"
    service = "key-manager"
    method  = "DELETE"
  }
}
```

### 示例 3：Swift —— 只允许访问 container 下特定路径

```hcl
data "openstack_identity_auth_scope_v3" "scope" {
  name = "my_scope"
}

resource "openstack_identity_application_credential_v3" "app_cred_1" {
  name  = "single-container-path"
  roles = ["objectstore_admin"]

  access_rules {
    path    = "/v1/AUTH_${data.openstack_identity_auth_scope_v3.scope.project_id}/test/subpath"
    service = "object-store"
    method  = "GET"
  }
  access_rules {
    path    = "/v1/AUTH_${data.openstack_identity_auth_scope_v3.scope.project_id}/test/subpath"
    service = "object-store"
    method  = "POST"
  }
  access_rules {
    path    = "/v1/AUTH_${data.openstack_identity_auth_scope_v3.scope.project_id}/test/subpath"
    service = "object-store"
    method  = "PUT"
  }
  access_rules {
    path    = "/v1/AUTH_${data.openstack_identity_auth_scope_v3.scope.project_id}/test/subpath"
    service = "object-store"
    method  = "DELETE"
  }
}
```

> Swift 路径格式：`/v1/AUTH_<project_id>/<container>/<object-path>`；用 auth scope data source 动态取 `project_id`。

### role 限制 vs access rules

| 维度 | 只用 `--role` | access rules |
|------|--------------|--------------|
| 粒度 | 服务级 / 项目级 role | 精确到 `service + path + method` |
| 支持范围 | 所有服务 | **仅 Barbican、Swift** |
| 典型用途 | 一般应用认证 | 脚本只需调 1-2 个具体 API |
| 最小版本 | CLI 3.15.0 | Terraform Provider v1.25.0 |

---

## 参考

- 上游规范：https://docs.openstack.org/keystone/latest/user/application_credentials.html
- Keystone Access Rules Spec (Stein)：https://specs.openstack.org/openstack/keystone-specs/specs/keystone/stein/
- SCI 内部文档：`cc/documentation-customer` → `identity/identity-service/application-credentials/`
