```
          用户
            │
            ▼
      Playwright
            │
            │ 1. 完成 SSO 登录
            │
            ▼
   企业门户 / Web UI
            │
            │ 2. 浏览器获得认证 Cookie
            ▼
    cookie.json 文件
            │
            │ 3. 提取 Cookie
            ▼
     Python/Go/Node
            │
            │ 4. 携带 Cookie 调用 REST API
            ▼
       后端业务系统
```

```
  串起来看 sap-authentication 的完整数据流

  你在 Claude Code 触发 sap-authentication
          │
          ▼
  [1] Claude Code 启动 Playwright MCP（已配置在 .mcp.json）
      npx @playwright/mcp@latest --browser msedge --headless --caps storage
          │
          ▼
  [2] AI 调用 mcp__playwright-headless__browser_navigate("https://jira.tools.sap/")
          │
          ▼
  [3] Playwright MCP server 收到 JSON-RPC 请求
          │ 调用 playwright API
          ▼
  [4] 启动 Edge 进程 → CDP 控制 → 加载 URL
      浏览器在内部 SQLite 写入 cookie（在 /tmp/xxx/ 临时目录）
          │
          ▼
  [5] AI 走 SSO 流程（snapshot/click/fill_form）
          │
          ▼
  [6] AI 调用 mcp__playwright-headless__browser_cookie_list()
          │
          ▼
  [7] MCP server → playwright context.cookies()
          │ → CDP 命令 Network.getAllCookies
          │ → 浏览器返回完整 cookie 列表
          ▼
  [8] AI 拿到 JSON 数组
          │
          ▼
  [9] AI 执行 bash: echo '<JSON>' | node save-cookies.mjs --store-path ~/...
          │
          ▼
  [10] sap_cookies.txt 写入磁盘 ✓
          │
          ▼
  [11] AI 调用 mcp__playwright-headless__browser_close()
       → /tmp/xxx/ 临时目录被删除，浏览器进程退出
       → 但 sap_cookies.txt 已经在你的磁盘上，与浏览器进程无关

  ---
  一句话总结

  Playwright MCP 启动一个独立的浏览器进程，通过 CDP
  协议远程控制它（导航、点击、填表），登录成功后再通过 CDP 的 Network.getAllCookies 命令把所有 cookie
  从浏览器内存里读出来，以 JSON 形式返回给 AI。AI 再把这些 cookie 用 save-cookies.mjs
  写到本地磁盘，从此就和浏览器进程脱钩，独立可用 24 小时。
```

### Comparasion 

从 AI Agent 的角度看（与你最近研究的 Playwright MCP 相关）

如果一个 AI Agent（例如 Claude Code 或 ChatGPT）通过 Playwright MCP 操作浏览器，它实际上拥有的是浏览器内部控制能力，而不是像人一样"看屏幕、移动鼠标"。

可以把三种方式放在一起比较：

| 能力               | 人类用户               | Playwright（CDP） | AI + Playwright MCP |
| ---------------- | ------------------ | --------------- | ------------------- |
| 点击按钮             | ✅                  | ✅               | ✅                   |
| 输入文字             | ✅                  | ✅               | ✅                   |
| 获取 DOM           | ❌（只能借助开发者工具查看）     | ✅               | ✅                   |
| 执行任意 JavaScript  | ❌（普通操作不能，需打开开发者工具） | ✅               | ✅                   |
| 修改 Cookie        | ❌（只能通过浏览器设置，不能程序化） | ✅               | ✅                   |
| 拦截 HTTP 请求       | ❌                  | ✅               | ✅                   |
| 修改 HTTP 响应       | ❌                  | ✅               | ✅                   |
| 获取 Network Trace | 有限（开发者工具查看）        | ✅               | ✅                   |
| 获取 Console 日志    | 有限（开发者工具查看）        | ✅               | ✅                   |
| 操作多个标签页          | 手动                 | ✅               | ✅                   |
| 自动等待元素可交互        | 人工判断               | ✅               | ✅                   |
所以，从工程角度来说，Playwright 的价值并不仅仅是“模拟用户点击”，而是作为浏览器的一个“受信任客户端”，通过 CDP 调用浏览器内部 API。正因为具备这种能力，它才能提供网络拦截、状态读取、自动等待等功能，而这些都超出了普通用户通过浏览器界面所能完成的操作