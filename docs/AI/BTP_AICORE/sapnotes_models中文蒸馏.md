# SAP Note 3437766 — SAP Generative AI Hub 可用模型整理

> **来源**：[SAP Note 3437766](https://me.sap.com/notes/3437766)  
> **版本**：152 · **发布日期**：2026-07-01  
> **相关文档**：[Available Models API](https://ai-docs.portal.hyperspace.tools.sap/llm-proxy/configuration/api-endpoints/#available-models)

---

## 一、按提供商 & 类型分类

### 🅰️ Anthropic（AWS Bedrock 托管）— 对话/推理模型

| 模型 | 版本 | 状态 |
|------|------|------|
| `anthropic--claude-3-haiku` | 1 | ⚠️ 已弃用，2026-09-10 退役，建议替换为 `claude-4.5-haiku` |
| `anthropic--claude-4-sonnet` | 1 | ⚠️ 已弃用，2026-10-14 退役，建议替换为 `claude-4.5-sonnet` |
| `anthropic--claude-4.5-haiku` | 1 (latest) | ✅ 当前 |
| `anthropic--claude-4.5-sonnet` | 1 (latest) | ✅ 当前 |
| `anthropic--claude-4.5-opus` | 1 (latest) | ✅ 当前 |
| `anthropic--claude-4.6-opus` | 1 | ✅ 当前 |
| `anthropic--claude-4.6-sonnet` | 1 | ✅ 当前 |
| `anthropic--claude-4.7-opus` | 1 | ✅ 当前（最新旗舰） |

### 🅱️ Azure OpenAI — GPT 系列（对话/推理）

| 模型 | 说明 |
|------|------|
| `gpt-4o` (2024-05-13 / 08-06 / 11-20) | ⚠️ 已弃用，2026-10-01 退役 → `gpt-5` |
| `gpt-4o-mini` | ⚠️ 已弃用 → `gpt-5-mini` |
| `gpt-4.1` / `gpt-4.1-mini` / `gpt-4.1-nano` | 2026-10-14 退役 |
| `gpt-5` (2025-08-07) | ✅ |
| `gpt-5-mini` / `gpt-5-nano` | ✅ |
| `gpt-5.1` (2025-11-13, latest) | ✅ |
| `gpt-5.2` (2025-12-11) | ✅ |
| `gpt-5.3-codex` (2026-02-24) | 🧑‍💻 代码专用 |
| `gpt-5.4` / `gpt-5.4-nano` | ✅ |
| `gpt-5.5` (2026-04-24) | ✅ 最新 |
| `o1` / `o3` / `o3-mini` / `o4-mini` | 🧠 推理模型（reasoning），均已计划退役 |

### 🎤 Azure OpenAI — 语音模型

| 模型 | 说明 |
|------|------|
| `gpt-realtime` (2025-08-28) | 🎙️ 实时语音模型；audio token 单独计费：输入 `0.01954` / 1K tokens，输出 `0.03901` / 1K tokens |

> ✅ 这是本 Note 中**唯一的语音（audio）模型**。

### 🔤 Embedding 嵌入模型

| 模型 | 提供商 | 版本 | 备注 |
|------|--------|------|------|
| `amazon--titan-embed-text` | AWS Bedrock | 1.2 / 2 (latest) | 文本嵌入 |
| `amazon--titan-embed-image` | AWS Bedrock | 1 (latest) | 图像嵌入（多模态） |
| `nvidia--llama-3.2-nv-embedqa-1b` | NVIDIA (SAP-managed) | 2 (latest) | 问答检索嵌入 |
| `text-embedding-3-large` | Azure OpenAI | 1 (latest) | 高精度文本嵌入 |
| `text-embedding-3-small` | Azure OpenAI | 1 (latest) | 轻量文本嵌入 |
| `text-embedding-ada-002` | Azure OpenAI | 2 (latest) | ⚠️ 已弃用 → `3-small` / `3-large` |
| `gemini-embedding` | GCP Vertex AI | 001 (latest) | Google 最新嵌入模型 |

### 🖼️ 图像/多模态模型

| 模型 | 提供商 | 说明 |
|------|--------|------|
| `amazon--titan-embed-image` | AWS | 图像嵌入 |
| `amazon--nova-pro` / `nova-lite` / `nova-micro` / `nova-premier` | AWS Bedrock | 多模态（Nova 系列） |
| `gemini-2.5-flash-image` | Google | 支持 text + image 双计费的图像生成/理解 |

### 🔎 Google Gemini（GCP Vertex AI）

| 模型 | 版本 |
|------|------|
| `gemini-2.5-flash` | 001 (latest)，2026-10-16 退役 |
| `gemini-2.5-flash-lite` | 001 (latest) |
| `gemini-2.5-flash-image` | 001 |
| `gemini-2.5-pro` | 001 (latest)，2026-10-16 退役 |
| `gemini-3.5-flash` | 001 (latest) |
| `gemini-3.1-flash-lite` | 001 |
| `gemini-embedding` | 001 (latest) |

### 🇪🇺 Mistral AI（SAP-hosted）

| 模型 | 版本 |
|------|------|
| `mistralai--mistral-large-instruct` | 2407 |
| `mistralai--mistral-medium-instruct` | 2505 |
| `mistralai--mistral-small-instruct` | 2503（已弃用 → `mistral-small`） |
| `mistralai--mistral-small` | 2603 |

### 🅲 Cohere

| 模型 | 类型 |
|------|------|
| `cohere--command-a-reasoning` (2508) | 🧠 推理对话模型 |
| `cohere-reranker` (3.5) | 🔁 重排序模型（Reranker，按 search_units 计费，非典型 embedding） |

### 🅢 SAP 自研模型（SAP-hosted）

| 模型 | 说明 |
|------|------|
| `sap-rpt-1-small` / `sap-rpt-1-large` | 📊 表格数据预测模型（按 cells 计费） |
| `sap-abap-1` | 💻 ABAP 代码专用模型（仅通过 orchestration 访问） |

### 🔍 Perplexity（联网搜索型对话）

| 模型 | 说明 |
|------|------|
| `perplexity sonar` / `sonar-pro` | 内置 web search，价格 = token + search 请求费 |

---

## 二、按功能类型汇总

| 类型 | 模型举例 |
|------|----------|
| 💬 对话/生成 (Chat/Completion) | Claude 4.x, GPT-4.x/5.x, Gemini 2.5/3.x, Mistral, Nova, Cohere Command |
| 🧠 推理 (Reasoning) | o1, o3, o3-mini, o4-mini, cohere-command-a-reasoning |
| 🔤 Embedding（嵌入） | titan-embed-text, titan-embed-image, nvidia-embedqa, text-embedding-3-large/small, ada-002, gemini-embedding |
| 🔁 Reranker（重排序） | cohere-reranker |
| 🖼️ 图像/多模态 | titan-embed-image, gemini-2.5-flash-image, nova 系列 |
| 🎙️ 语音（Audio/Realtime） | gpt-realtime（唯一） |
| 🌐 联网搜索 | perplexity sonar / sonar-pro |
| 💻 代码专用 | gpt-5.3-codex, sap-abap-1 |
| 📊 表格预测 | sap-rpt-1-small, sap-rpt-1-large |

---

## 三、关键结论

1. **Embedding 模型共 7 款**（含图像嵌入 1 款）：Titan Text v1.2/v2、Titan Image v1、NVIDIA EmbedQA、Azure text-embedding-3-large/small、ada-002（已弃用）、Gemini embedding。
2. **语音模型有 1 款**：Azure `gpt-realtime`（2025-08-28），支持实时语音输入输出；audio token 单独计费，比文本 token 贵约 4~8 倍。
3. **未来主推**：Claude 4.5+/4.6/4.7 系列、GPT-5.x 系列、Gemini 3.x 系列、Nova v2。
4. **近期需迁移**：
   - GPT-4o 系列 → GPT-5
   - Claude 3.x/4 → Claude 4.5+
   - Gemini 2.x → Gemini 3.x
   - ada-002 → text-embedding-3-*
