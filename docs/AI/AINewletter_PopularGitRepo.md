
##  Claude Code Plugins 

1. 

核心思想：

context window ≠ memory
filesystem = memory

所以它会强制 agent：

- 先计划
- 再执行
- 持久化记录
- 重新读取历史
https://github.com/OthmanAdi/planning-with-files

How to install to ClaudeCode:
```
/plugin marketplace add OthmanAdi/planning-with-files
/plugin install planning-with-files@planning-with-files
```

## . General AI Stuff

https://agentskills.io/home

为什么 skills 很重要

因为大模型本身：

- 没长期记忆
- 容易丢上下文
- 长任务会漂移
- Debug 会忘历史