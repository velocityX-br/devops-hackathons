1. Qdrant collection has not been indexed — the collection simply doesn't exist in the vector store. This is a data availability
  problem, not a tool problem.
2. 



Sub-agent

```
              User
                │
           Main Agent
          ┌─────┴──────┐
          │            │
        ACP          MCP
          │            │
      Sub Agent      GitHub
          │          Browser
      Code Agent      SQL
```