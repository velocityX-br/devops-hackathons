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
