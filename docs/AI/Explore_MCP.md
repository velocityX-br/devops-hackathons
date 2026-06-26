

https://github.com/containers/kubernetes-mcp-server 

https://blog.marcnuri.com/2025-year-in-review-the-year-of-ai

MCP Clients: https://github.com/punkpeye/awesome-mcp-clients?tab=readme-ov-file#clients

https://github.com/anthropics/claude-plugins-official/tree/main/plugins/mcp-server-dev

https://teams.example.com/l/message/placeholder

#### github specific MCP
https://github.com/github/github-mcp-server?utm_source=chatgpt.com 
https://portal.hyperspace.tools.pppdemands.com/hyperspace-ai/mcp-registry
https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md

#### configure to run globally
```
# 
{
  "mcpServers": {
    "ppp-wiki": {
      "command": "node",
      "args": [
        "/Users/USER001/Workdir/Github/CIEA_Reference_Repo/ciea-ai-journey/mcp_servers/ppp-wiki-mcp/dist/server.js"
      ]
    }
  }
}


# Or temp
claude mcp add ppp-wiki \
node \
/Users/USER001/Workdir/Github/CIEA_Reference_Repo/ciea-ai-journey/mcp_servers/ppp-wiki-mcp/dist/server.js
```

Definition:
MCP（Model Context Protocol）是 Anthropic 定义的开放协议，允许 AI 模型通过标准化接口调用外部工具和数据源。本质上是 JSON-RPC 2.0 over stdio（或 HTTP+SSE）

Model Context Protocol 是 Anthropic 提出的开放协议，定义了 AI 模型与外部工具/资源之间的标准通信格式。MCP 服务器通过声明 **Tools**（工具）、**Resources**（资源）、**Prompts**（提示模板）等能力，让 AI 客户端能够发现并调用这些能力。

- Tools: ppp-wiki, plato-mcp

如果你想自己实现类似功能（而不依赖 Kapa.ai），需要自己搭建：文档爬取 → 向量化存储 → RAG 检索 → LLM 调用 这一套流程。需要我帮你规划这样的实现方案吗？

