
### Source Of Truth:
Available models - bible article:
https://example.com/redacted
https://example.com/redacted


https://example.com/redacted 

https://example.com/redacted

Consume PPP BTP Services from Any Hyperscaler
https://example.com/redacted
https://github.com/PPP/ppp-btp-service-operator
https://example.com/redacted
https://example.com/redacted

https://example.com/redacted
Bryan0701: when and why we should use orchestration turtorial ?
The orchestration service runs on PPP AI Core under the global AI scenario orchestration. It provides unified access to multiple generative AI models through consistent code, configuration, and deployment.

https://example.com/redacted  

PPP BTP AI Core Supported Models
https://example.com/redacted gpt-realtime

Code Repo for reference
https://github.com/PPP-samples/ai-core-samples 
https://github.com/PPP-samples/btp-generative-ai-hub-use-cases


API_Interface: https://example.com/redacted
https://ppp-contributions.github.io/litellm-agentic-examples/
https://docs.litellm.ai/docs/

https://example.com/redacted


把企业级知识库融入到项目开发。
wheel 中自带的 Sphinx 文档作为唯一可信的数据源，而不是依赖 PyPI 或 https://example.com/redacted。这对于构建本地知识库、RAG 索引或让 AI Agent 理解 SDK API，都是一个非常稳妥且版本一致的做法。

⏺ pydoc HTML 把整个递归类层级展开了，所以 gen_ai_hub.orchestration_v2.md 之类的"聚合页"有 2.7 MB。这没问题——对 Grep 友好，对 Read 用 offset/limit 控制。Claude 会先 Grep 找定位再 Read。
  不过为了避免无谓的体积，让我抽样看下内容质量，确认转换无破损。
⏺ Read 1 file (ctrl+o to expand)
⏺ 类签名、构造参数、docstring 全部完整保留——绝对够用。Jenkins 工作区路径也被我的 awk 干掉了。
  注意：网络抓的版本格式更紧凑漂亮（Sphinx），但 venv 自带的有几个无与伦比的优势：
  - 包含 ppp-ai-sdk-base 的文档（https://example.com/redacted 上根本没有）
  - 永远和 pinned 版本匹配
  - 无需任何网络

  让我用刚镜像的 base 文档抽测一个真实使用场景。



```
⏺ Fetch(https://example.com/redacted)
  ⎿  Received 1.1KB (200 OK)

⏺ The web fetch is blocked. Let me search for known documentation patterns.

⏺ Fetch(https://pypi.org/project/generative-ai-hub-sdk/)
  ⎿  Received 65.2KB (200 OK)

⏺ Fetch(https://github.com/PPP-samples/btp-generative-ai-hub-use-cases)
  ⎿  Received 313.5KB (200 OK)

⏺ Let me invoke the brainstorming skill first since we're about to do creative implementation work, and check the latest SDK package.

⏺ Fetch(https://pypi.org/project/ppp-ai-sdk-gen/)
  ⎿  Received 65.1KB (200 OK)

⏺ Fetch(https://example.com/redacted)
  ⎿  Received 1.1KB (200 OK)

⏺ Let me get authenticated content via the proper tools and check if there's local SDK info.

⏺ Bash(which uv && uv --version)
  ⎿  Running…

⏺ Fetch(https://example.com/redacted)
```
Good article from PPP Community:
https://example.com/redacted
https://ppp-contributions.github.io/litellm-agentic-examples/


Sample Code Repositories:
1. https://github.com/PPP-samples/codejam-code-based-agents/
2. 


FinOps: Crew (Probably integrate with BTP AI Core)
https://crewai.com/open-source
https://example.com/redacted
https://docs.litellm.ai/docs/providers/sap 