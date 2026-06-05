

https://github.com/containers/kubernetes-mcp-server 

https://blog.marcnuri.com/2025-year-in-review-the-year-of-ai

MCP Clients: https://github.com/punkpeye/awesome-mcp-clients?tab=readme-ov-file#clients

https://github.com/anthropics/claude-plugins-official/tree/main/plugins/mcp-server-dev

https://teams.microsoft.com/l/message/19:b59282005aa349c5a4a42e507df0227e@thread.tacv2/1776285039401?tenantId=42f7676c-f455-423c-82f6-dc2d99791af7&groupId=28a96358-ff3c-48dd-8c2c-2b67778ac532&parentMessageId=1776279423247&teamName=Hyperspace%20Community&channelName=LLM%20Proxy&createdTime=1776285039401

#### github specific MCP
https://github.com/github/github-mcp-server?utm_source=chatgpt.com 
https://portal.hyperspace.tools.sap/hyperspace-ai/mcp-registry
https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md

#### configure to run globally
```
# 
{
  "mcpServers": {
    "sap-wiki": {
      "command": "node",
      "args": [
        "/Users/I577081/Workdir/Github/CIEA_Reference_Repo/ciea-ai-journey/mcp_servers/sap-wiki-mcp/dist/server.js"
      ]
    }
  }
}


# Or temp
claude mcp add sap-wiki \
node \
/Users/I577081/Workdir/Github/CIEA_Reference_Repo/ciea-ai-journey/mcp_servers/sap-wiki-mcp/dist/server.js
```

Definition:
MCP（Model Context Protocol）是 Anthropic 定义的开放协议，允许 AI 模型通过标准化接口调用外部工具和数据源。本质上是 JSON-RPC 2.0 over stdio（或 HTTP+SSE）

Model Context Protocol 是 Anthropic 提出的开放协议，定义了 AI 模型与外部工具/资源之间的标准通信格式。MCP 服务器通过声明 **Tools**（工具）、**Resources**（资源）、**Prompts**（提示模板）等能力，让 AI 客户端能够发现并调用这些能力。

- Tools: sap-wiki, plato-mcp

如果你想自己实现类似功能（而不依赖 Kapa.ai），需要自己搭建：文档爬取 → 向量化存储 → RAG 检索 → LLM 调用 这一套流程。需要我帮你规划这样的实现方案吗？

