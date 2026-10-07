
>FastAPI 是“Web API 框架”，负责把 Python 函数/业务逻辑暴露成 HTTP API。
>LangGraph API 是“Agent/Graph Runtime API”，负责把一个 LangGraph 工作流/Agent 以 API 的方式运行、管理和调用。

因此FastAPI and LangGraph API不是简单的竞品关系，实际上经常是上下层关系。

|                   | FastAPI                 | LangGraph API                |
| ----------------- | ----------------------- | ---------------------------- |
| 定位                | Web/API Framework       | Agent/Graph Runtime          |
| 核心对象              | HTTP Request / Response | Graph / State / Thread / Run |
| 主要用途              | 构建 REST API、Web API     | 构建和运行 Agent、LLM Workflow     |
| 是否专门面向 AI         | ❌                       | ✅                            |
| 状态管理              | 需要自己实现                  | LangGraph 原生支持               |
| Agent 循环          | 自己写                     | Graph 中天然支持                  |
| Human-in-the-loop | 自己实现                    | 原生概念                         |
| Checkpoint        | 自己实现                    | 原生支持                         |
| Streaming         | FastAPI 支持，但自己设计        | Agent/Graph streaming 是核心能力  |
| Tool calling      | 自己实现                    | Agent workflow 中直接建模         |
| 部署                | ASGI server，例如 Uvicorn  | LangGraph Runtime/Server     |
| 灵活性               | 非常高                     | 针对 Agent 场景更高层               |
