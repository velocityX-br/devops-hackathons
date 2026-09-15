---
sidebar_position: 3
---

# Persephone GitOps 晋升流水线（GitHub Actions + ArgoCD）

一个真实的「GitHub Actions 编排 + ArgoCD 同步」案例：通过 5 个 workflow 实现
QA → Canary → Prod 三级渐进式发布，核心思路是 **改 Git 里的 YAML → 提交推送 →
ArgoCD 自动同步到集群**，workflow 本身从不直接 kubectl 操作集群（force-sync 除外）。

## 5 个 Workflow 总览

| 编号 | 文件 | 触发 | 作用 |
|------|------|------|------|
| 010 | `sync-deployment.yaml` | 自动 `repository_dispatch` + 手动 | 部署到 QA |
| 011 | `promote-canary.yaml` | 仅手动 | QA → Canary |
| 012 | `promote-production.yaml` | 仅手动 | Canary → Prod |
| 014 | `force-sync-secret.yaml` | 仅手动 | 强制刷新运行时配置 Secret |
| 015 | `force-sync-managedseed-secret.yaml` | 仅手动 | 强制刷新 seed 的 Vault 凭证 |

```
源码仓库 push main
    │ repository_dispatch (type: deployment-params, client_payload.sha)
    ▼
[010] Deploy QA ─写 qa/─▶ git push ─▶ ArgoCD 同步 prt-q
    │ (人工验证后手动触发)
    ▼
[011] Promote Canary ─读 qa SHA→写 canary/─▶ ArgoCD 同步 prt-c
    │ (人工验证后手动触发)
    ▼
[012] Promote Prod ─读 canary SHA→写 prod/─▶ ArgoCD 同步 prt-p
```

## 010 — Deploy To QA（入口，唯一自动触发）

**跨仓触发机制**：上游源码仓库构建出新镜像后，通过 GitHub API 发 `deployment-params`
事件，`client_payload.sha` 携带镜像 commit SHA。

### 源码仓库侧（发送方）

在**上游 `persephone` 源码仓库**的 CI 里，用 `peter-evans/repository-dispatch` 向部署仓库
发送事件——这是整条链路的**起点**：

```yaml
- name: Trigger deployment to development
  uses: peter-evans/repository-dispatch@v4
  with:
    token: ${{ steps.app-token.outputs.token }}        # 源码仓库侧同样用短期 App token 跨仓授权
    repository: ppp-cloud-infrastructure/persephone-deployment  # 目标 = 部署仓库
    event-type: deployment-params                      # 与部署仓库 010 的 types 完全对应（约定暗号）
    client-payload: '{"ref": "${{ github.ref }}", "sha": "${{ github.sha }}"}'  # 载荷：分支 + 镜像 SHA
```

### 部署仓库侧（接收方 = 010）

```yaml
on:
  repository_dispatch:
    types: [deployment-params]   # ← 精确匹配发送方的 event-type
  workflow_dispatch:             # 也可手动输入 SHA
    inputs:
      sha_commit: { default: "latest" }
```

两侧的对应关系：

| 发送方（源码仓库） | 接收方（部署仓库 010） |
|---|---|
| `event-type: deployment-params` | `on.repository_dispatch.types: [deployment-params]` |
| `client-payload.sha` | `${{ github.event.client_payload.sha }}` → 写入镜像 tag / `IMAGE_SHA` |
| `client-payload.ref` | `${{ github.event.client_payload.ref }}` → 写入 config.yaml 的 `source-ref` |

于是完整链路为：**源码仓库构建镜像 → 发 `deployment-params` 事件（带 sha）→ 部署仓库 010
被唤醒 → 写 qa/ 并提交 → ArgoCD 同步 prt-q**。

### IMAGE_SHA 是什么、如何获得

`IMAGE_SHA` = **上游源码仓库那次构建对应的 Git commit SHA**（40 位十六进制），它同时被用作
镜像 tag（`newTag`）和远程 config 的 `?ref=`，实现「代码 commit = 镜像版本 = 配置版本」三者对齐。

它一路从源码仓库传来：源码仓库侧 `client-payload` 里的 `sha` 取自内置的 `${{ github.sha }}`，
经 `repository_dispatch` 事件传到部署仓库后，用 `github.event.client_payload.sha` 读出：

```
源码仓库 github.sha ─写进 client-payload.sha─▶ repository_dispatch 事件
   ─传到部署仓库─▶ github.event.client_payload.sha ─赋值─▶ IMAGE_SHA
```

> ⚠️ **坑：job 顶层的 `env` 只在自动触发时有值。**
> ```yaml
> env:
>   IMAGE_SHA: ${{ github.event.client_payload.sha }}
> ```
> `client_payload` 只有 `repository_dispatch`（自动触发）时才存在；手动 `workflow_dispatch`
> 触发时该上下文为空，这行会把 `IMAGE_SHA` 设成空字符串。

因此 010 用两个「Override」步骤按触发方式兜底，写进 `$GITHUB_ENV`（对同 job 后续 step 可见）：

```yaml
- name: Override variables for triggered workflow
  if: github.event_name == 'repository_dispatch'
  run: echo "IMAGE_SHA=${{ github.event.client_payload.sha }}" >> $GITHUB_ENV

- name: Override variables for manual workflow
  if: github.event_name == 'workflow_dispatch'
  run: echo "IMAGE_SHA=${{ github.event.inputs.sha_commit }}" >> $GITHUB_ENV
```

`IMAGE_SHA` 的最终值由触发方式决定：

| 触发方式 | `IMAGE_SHA` 来源 |
|----------|------------------|
| 自动 `repository_dispatch` | `github.event.client_payload.sha`（即源码仓库的 `github.sha`） |
| 手动 `workflow_dispatch` | `github.event.inputs.sha_commit`（人工输入框，默认 `latest`） |

关键步骤：
1. 用 `create-github-app-token` 动态申请只带 `contents: write` 的**短期 App token**
   （不用长期 PAT）。
2. 用 `yq` 改 `config.yaml`（镜像/版本/时间戳，仅供展示的 ConfigMap）。
3. 用 `yq` 改 `kustomization.yaml`——**真正生效**：把远程 config 和镜像 tag 都钉到同一 SHA。
   ```bash
   yq e '.resources[1] = ".../config/environments/qa?ref=<SHA>"'
   yq e '.images[0].name = ".../ccloud/persephone/persephone"'
   yq e '.images[0].newTag = "<SHA>"'
   ```
4. 幂等提交：`if [ -n "$(git status --porcelain)" ]` 有变更才 commit。

> 注意：`config.yaml` 里的镜像名（`persephone/gardener-customer-webhook`）与
> `kustomization.yaml` override 里的（`ccloud/persephone/persephone`）不一致。
> 前者仅信息展示，后者才是真正 patch 到 Deployment 的镜像。

## 011 / 012 — 晋升（Read-forward 模式）

**仅手动触发**，是渐进式发布的人工闸门。核心是 **read-forward**：不需人工输 SHA，
直接读上一级已跑通的 SHA，杜绝复制粘贴出错。

```bash
# 011: 读 QA 的 SHA
QA_IMAGE_SHA=$(yq e '.images[0].newTag' argocd/manifests/qa/kustomization.yaml)
# 012: 读 Canary 的 SHA
CANARY_IMAGE_SHA=$(yq e '.images[0].newTag' argocd/manifests/canary/kustomization.yaml)
```

晋升动作 = 整体复制上一级配置 → 只改环境专属字段（environment / cluster / 远程 config
路径），**SHA 保持完全一致**，确保「测过的东西一字不差往前推」：

```bash
cp .../qa/config.yaml       .../canary/config.yaml
cp .../qa/kustomization.yaml .../canary/kustomization.yaml
yq '.data.environment = "canary"'
yq '.data.cluster = "prt-c-eu-de-1"'
yq '.resources[1] = ".../config/environments/canary?ref=<SHA>"'
```

011 与 012 结构完全相同，只是整体后移一级：

| 项目 | 011 | 012 |
|------|-----|-----|
| 读取来源 | `qa/kustomization.yaml` | `canary/kustomization.yaml` |
| 目标环境 / 集群 | canary / `prt-c-eu-de-1` | prod / `prt-p-eu-de-1` |
| 远程 config 路径 | `environments/canary` | `environments/prod` |

三级流水线因此形成一条**只能往前推、每步都留 Git 记录**的链条，回滚只需
`git revert` 对应的 promote commit。

## 014 / 015 — Force Sync（运维逃生舱）

解决的 GitOps 难题：AppSet 里配了 `ignoreDifferences` **永久忽略** Vault 注入的字段，
导致 ArgoCD 永远不同步该 Secret；当 Vault 密钥更新后需强制刷一次。

与发布 workflow 的最大不同：**需要直连集群**。
```yaml
permissions:
  id-token: write        # OIDC 换取集群访问（无长期凭证）
```
- 装 argocd CLI；用 `run/garden-github-oidc` action 以 `audience: persephone-deployment`
  换 KubeConfig。
- `argocd app get ... --core`：`--core` 直连 K8s API，不经过 argocd server。

**「关闭 → 强制同步 → 恢复 → 再同步」四步舞：**
```
1. 保存 ignoreDifferences 到 /tmp，清空它 (yq '... = []')  ─commit(bot)─▶ push
   → commit: "Temporarily disable ignoreDifferences in AppSet"
2. 遍历 AppSet 里每个 cluster: argocd app sync persephone-<cluster> --force --core
   ← 忽略规则被清掉，ArgoCD 真正覆写 Secret
3. 从 /tmp 恢复 ignoreDifferences  ─commit(bot)─▶ push
   → commit: "Restore ignoreDifferences in AppSet"
4. 再 force sync 一次
```
Git 历史里成对出现的 `Temporarily disable` / `Restore ignoreDifferences` 提交即由此而来。
用两次提交「先开后关」制造一次真实 diff 触发同步，同步完立刻恢复保护。

提交用 **bot 身份** `sci-gitops[bot]`，并通过 `insteadOf` URL 重写注入 token、清掉
checkout 残留的 extraheader，避免 token 冲突。

014 与 015 几乎逐字相同，区别：

| 项目 | 014 | 015 |
|------|-----|-----|
| 目标 AppSet | `persephone-appset.yaml` | `persephone-managedseed-appset.yaml` |
| 忽略字段 | Secret `persephone-config-{operator,webhook}` 的 `/data/config.yaml` | Secret 的 OpenStack `applicationCredential{ID,Name,Secret}` |
| 同步 App 名 | `persephone-<cluster>` | `persephone-managedseed-<cluster>` |

## 贯穿全部 workflow 的设计要点

1. **self-hosted runner**：需访问 PPP 内网 `example.com/redacted` 与内部集群。
2. **GitHub App 短期 token**：每次动态申请 `contents: write`，不用长期 PAT。
3. **幂等提交**：commit 前 `git status --porcelain` 检查，无变更就跳过。
4. **`git clean -df`**：提交前清理工作区，防止 yq 临时文件被误提交。
5. **Read-forward 晋升**：011/012 从上一级读 SHA，杜绝人工输错。
6. **GitOps 而非直接 kubectl**：010/011/012 只改 Git 由 ArgoCD 同步；仅 014/015
   因需「强制」才破例直连集群。

## 可复用模式

- **SHA-as-single-pin**：镜像 tag + 远程 config revision 钉同一 commit，字节级一致晋升 + git 原生回滚。
- **Read-forward promotion**：下一级从上一级已提交状态读取输入，消除人工重输一类错误。
- **ignoreDifferences toggle 强制同步**：临时清空忽略规则→提交→制造 diff→同步→恢复，
  作为 GitOps + 外部 Secret 注入器场景的按需刷新逃生舱（配合
  `ignoreApplicationDifferences: /spec/syncPolicy` 使用）。
