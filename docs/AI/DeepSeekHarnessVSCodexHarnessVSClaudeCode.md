我来搜索这三个工具的最新信息，以便进行全面的多维度对比。
上方交互式仪表板已加载完成，可通过顶部标签切换查看 **全景概览、维度矩阵、架构对比、性能数据、场景决策、演进时间线** 六大板块。以下是对三个框架的系统性文字解读。

---

## 一、本质定位：三者根本不是同一类东西

先厘清一个关键前提——这三个名称相似，但**本质完全不同**：

| | **Claude Code** | **DeepSeek Harness** | **Codex Harness** |
|---|---|---|---|
| **本质** | 终端编码智能体产品 | LLM 评估框架 | Agent 执行框架 |
| **类比** | 像 Cursor 或 IDE 插件 | 像 pytest + benchmark 工具链 | 像 LangChain 的底层运行时 |
| **谁用它** | 开发者日常写代码 | 模型研究者做评测 | 工程师把 AI 嵌入产品 |

Claude Code 是**面向终端用户的生产力工具**；DeepSeek Harness 是**面向研究者的评估基础设施**；Codex Harness 是**面向开发者的 Agent 运行时引擎**。这是理解所有对比的根基。  

---

## 二、横向十二维度对比矩阵

### 1. 开源与控制权
- **Claude Code**：❌ 完全闭源，Anthropic 专有产品，$20–$200/月订阅，且存在隐藏的周限额锁号机制 
- **DeepSeek Harness**：✅ MIT 协议，完全开源可商用，自托管零订阅费，运行时归你所有 
- **Codex Harness**：✅ Apache-2.0 协议，2026年8月刚开源，三大组件（CLI / SDK / App-Server）全部开放 

### 2. 模型绑定 vs 灵活性
- **Claude Code**：深度绑定 Claude 家族（Opus 4.6 / Sonnet 4.6 / Haiku 4.5），模型路由由 Anthropic 内部决策，用户无选择权
- **DeepSeek Harness**：**Provider 可移植性是内建能力**，可通过 `ai-sdk-provider-dsh` 桥接 OpenAI、Anthropic、DeepSeek 等任意端点，换模型不换工具 
- **Codex Harness**：围绕 OpenAI GPT-5.x 系列优化，紧耦合但深度调优

### 3. 架构哲学
- **Claude Code**：**委托-审查模式** —— Lead Agent 分解任务 → Sub-Agent 并行执行（共享文件系统）→ 结果聚合审查。`/agents` 命令可启动并行子代理， wall-clock 时间可缩短约 50% 
- **DeepSeek Harness**：**一切皆插件** —— Dataset、Model、Metric、Task、Skill 全部插件化，社区已有数百个插件 
- **Codex Harness**：**分层执行系统** —— `codex exec`（CLI 单次任务）→ Codex SDK（编程式控制）→ `app-server`（产品嵌入核心引擎），通过 JSON-RPC 协议暴露持久状态与事件流 

### 4. 上下文与记忆
- **Claude Code**：1M Token 窗口 + **Dreaming** 跨会话记忆策展，自动提取模式并优化长期记忆 
- **DeepSeek Harness**：依赖 Provider 本身的上下文能力，但可通过插件扩展记忆层
- **Codex Harness**：**上下文压缩**是核心优化——保留推理链同时压缩冗余上下文，仅此一项让 GPT-5.6 Sol 在 ARC-AGI-3 从 13.3% 飙升至 38.3%，且 Token 输出量减少 6 倍 

### 5. 沙箱与安全
- **Claude Code**：Managed Agents 提供沙箱执行、自动检查点、凭证管理、权限范围控制，支持 `--dangerously-skip-permissions` 但存在被恶意 skill 利用的风险 
- **DeepSeek Harness**：Docker 级评估沙箱，适合模型评测的隔离需求
- **Codex Harness**：OS 级沙箱，支持有边界的 Agent 工作流，Human-in-the-loop 审批门原生集成

### 6. 多代理编排
- **Claude Code**：⭐⭐⭐⭐⭐ **原生最强**，Lead + Specialist Sub-Agent 并行，共享文件系统，Console 可审计每个子代理行为 
- **DeepSeek Harness**：⭐⭐⭐ 插件可扩展多代理模式，但非核心设计目标
- **Codex Harness**：⭐⭐⭐ `codex exec` 偏单任务，多代理需通过 SDK 自行开发

### 7. 成本结构
- **Claude Code**：固定订阅制（$20/Pro → $200/Max 20x），但 Agent 工作流消耗巨大，存在**周限额悖论**——付费用户反而比免费用户更容易被锁号 
- **DeepSeek Harness**：Harness 本身零费用，仅需自托管基础设施 + 模型 API 调用费，长期成本最可控
- **Codex Harness**：Harness 免费，但 OpenAI API 按量计费；得益于上下文压缩，实际 Token 成本可降低 83%

### 8. 产品嵌入能力
- **Claude Code**：⭐⭐ 主要为终端交互设计，嵌入第三方产品需绕路
- **DeepSeek Harness**：⭐⭐⭐ 可作为评估基础设施嵌入，但非面向终端用户场景
- **Codex Harness**：⭐⭐⭐⭐⭐ **设计目标就是嵌入**——App-Server 通过 JSON-RPC 让任何应用接入本地 Codex 进程，保持持久对话状态、流式事件、中断能力、工具暴露 

---

## 三、纵向演进脉络

### Claude Code：从工具到平台
2025 年诞生时只是一个实验性 CLI，2026 年 Q1 爆发式迭代（v2.1.69 → v2.1.101，五周 30+ 版本），核心演进路径是**从「单智能体编码助手」进化为「多智能体编排平台」**——Managed Agents 解决基础设施问题，Computer Use 突破终端边界，Dreaming 解决记忆退化，Outcomes 解决质量门控。Anthropic 在 2026 年 5 月的 Code with Claude 大会上明确表态：不发布新模型，只打磨 harness（脚手架），因为「瓶颈不在模型能力，而在模型周围的 infrastructure」。

### DeepSeek Harness：从评估工具到生态底座
早期作为 BigCode Evaluation Harness 的替代方案出现，核心解决「模型评测碎片化」问题。2026 年随着 DeepSeek V4 发布，Harness 进化为**插件化评估平台**，社区贡献数百个插件，覆盖从 HumanEval/MBPP 到自定义业务基准的全场景。其纵向演进特征是**去中心化**——不绑定任何模型，不绑定任何场景，通过插件协议成为 AI 生态的「评测基础设施」。

### Codex Harness：从内部引擎到开源平台
2025 年 Codex 作为编程智能体发布时，Harness 只是其内部执行循环。2026 年 8 月 OpenAI 将其全面开源，战略意图明显：**从「做一个好用的代码助手」转向「让所有人都能在自己的产品里长出一个 Codex」**。Greg Brockman 在 X 上强调「Codex 能驱动的远不止编程工具」。Cisco（云管理）、Thrive Holdings（税务申报，7,000 份申报时间缩短 1/3）已成为早期企业用户。

---

## 四、关键洞察：Harness 设计的杠杆效应

OpenAI 开源 Codex Harness 时披露了一个极具说服力的数据：仅对 Harness 做两项调整（保留推理 + 上下文压缩），同一模型（GPT-5.6 Sol）在 ARC-AGI-3 的得分从 13.3% 提升到 38.3%（近 3 倍），同时 Token 消耗降至 1/6。

这揭示了一个行业共识：**模型能力固然重要，但 Harness（执行系统）的设计才是决定 Agent 最终表现的关键**。Claude Code 的 Dreaming/Outcomes、DeepSeek Harness 的插件化评估、Codex Harness 的上下文压缩，本质上都是在同一模型能力基础上，通过 harness 工程实现「脱胎换骨」。

---

## 五、决策建议

| 你的需求 | 推荐选择 | 理由 |
|---|---|---|
| 今天就要最好的开箱即用编码体验，接受封闭生态 | **Claude Code** | 终端 UX 打磨最精致，多代理编排原生最强 |
| 需要自托管、模型灵活、构建自定义评估/工作流 | **DeepSeek Harness** | MIT 开源，Provider 自由切换，插件生态丰富，零订阅费 |
| 要把 Agent 能力嵌入自有产品，已用 OpenAI 生态 | **Codex Harness** | App-Server 专为嵌入设计，Token 成本优化显著，Human-in-the-loop 原生 |
| 预算敏感、拒绝订阅制、需要长期可控成本 | **DeepSeek Harness** | 无席位费，自托管基础设施成本固定 |
| 做模型选型、A/B 测试、排行榜 | **DeepSeek Harness** | 评估框架是本职，多模型对比是核心能力 |
| 做 CI/CD 自动化、客服、运营等非编码 Agent | **Codex Harness** | 框架不限于编程，Cisco/税务场景已验证 |

**混合策略**：许多团队实际采用「Claude Code（日常编码）+ Codex Harness（产品嵌入/自动化）」或「DeepSeek Harness（模型评估）+ Claude Code（编码执行）」的双栈方案，取长补短而非非此即彼。