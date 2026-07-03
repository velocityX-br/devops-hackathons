
### Source Of Truth:
Available models - bible article:
https://me.sap.com/notes/3437766
https://ai-docs.portal.hyperspace.tools.sap/llm-proxy/configuration/api-endpoints/#available-models


https://emea.cockpit.btp.cloud.sap/cockpit/#/globalaccount/dca6b24d-5afc-4bec-8c2c-25e5cc9dd0fb/subaccount/955a5585-a5c2-4122-9c01-35cc6b9cf94d/entitlements 

https://help.sap.com/docs/service-manager/sap-service-manager/what-s-new-for-sap-service-manager?version=Cloud

Consume SAP BTP Services from Any Hyperscaler
https://developers.sap.com/tutorials/btp-hyperscaler-extension.html?locale=en-US
https://github.com/SAP/sap-btp-service-operator
https://discovery-center.cloud.sap/
https://help.sap.com/doc/generative-ai-hub-sdk/CLOUD/en-US/_reference/README_sphynx.html

https://developers.sap.com/tutorials/ai-core-orchestration-consumption.html?locale=en-US
Bryan0701: when and why we should use orchestration turtorial ?
The orchestration service runs on SAP AI Core under the global AI scenario orchestration. It provides unified access to multiple generative AI models through consistent code, configuration, and deployment.

https://github.tools.sap/hAIperspace/  

Sap BTP AI Core Supported Models
https://me.sap.com/notes/3437766 gpt-realtime

Code Repo for reference
https://github.com/SAP-samples/ai-core-samples 
https://github.com/SAP-samples/btp-generative-ai-hub-use-cases


API_Interface: https://help.sap.com/doc/generative-ai-hub-sdk/CLOUD/en-US/_api_doc/gen_ai_hub.html
https://sap-contributions.github.io/litellm-agentic-examples/
https://docs.litellm.ai/docs/

https://github.tools.sap/sdl-ipa/skills/tree/main


把企业级知识库融入到项目开发。
wheel 中自带的 Sphinx 文档作为唯一可信的数据源，而不是依赖 PyPI 或 help.sap.com。这对于构建本地知识库、RAG 索引或让 AI Agent 理解 SDK API，都是一个非常稳妥且版本一致的做法。

⏺ pydoc HTML 把整个递归类层级展开了，所以 gen_ai_hub.orchestration_v2.md 之类的"聚合页"有 2.7 MB。这没问题——对 Grep 友好，对 Read 用 offset/limit 控制。Claude 会先 Grep 找定位再 Read。
  不过为了避免无谓的体积，让我抽样看下内容质量，确认转换无破损。
⏺ Read 1 file (ctrl+o to expand)
⏺ 类签名、构造参数、docstring 全部完整保留——绝对够用。Jenkins 工作区路径也被我的 awk 干掉了。
  注意：网络抓的版本格式更紧凑漂亮（Sphinx），但 venv 自带的有几个无与伦比的优势：
  - 包含 sap-ai-sdk-base 的文档（help.sap.com 上根本没有）
  - 永远和 pinned 版本匹配
  - 无需任何网络

  让我用刚镜像的 base 文档抽测一个真实使用场景。



```
⏺ Fetch(https://help.sap.com/doc/sap_generative_ai_hub_sdk/CLOUD/en-US/_reference/orchestration.html)
  ⎿  Received 1.1KB (200 OK)

⏺ The web fetch is blocked. Let me search for known documentation patterns.

⏺ Fetch(https://pypi.org/project/generative-ai-hub-sdk/)
  ⎿  Received 65.2KB (200 OK)

⏺ Fetch(https://github.com/SAP-samples/btp-generative-ai-hub-use-cases)
  ⎿  Received 313.5KB (200 OK)

⏺ Let me invoke the brainstorming skill first since we're about to do creative implementation work, and check the latest SDK package.

⏺ Fetch(https://pypi.org/project/sap-ai-sdk-gen/)
  ⎿  Received 65.1KB (200 OK)

⏺ Fetch(https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/orchestration-deployment)
  ⎿  Received 1.1KB (200 OK)

⏺ Let me get authenticated content via the proper tools and check if there's local SDK info.

⏺ Bash(which uv && uv --version)
  ⎿  Running…

⏺ Fetch(https://help.sap.com/doc/generative-ai-hub-sdk/CLOUD/en-US/_reference/orchestration.html)
```