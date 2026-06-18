# AI Trading DMV Submission

## 提交表可复制版

### 第一段 · 思路

AI Trading DMV 是一个给 AI 交易员上实盘权限前使用的沙盒路测系统。我们做这个项目，是因为现在很多 Agent 平台已经能给 AI 提供行情、账户、工具调用甚至交易入口，但中间缺少一个“上岗前考试”：这个 Agent 到底能不能遵守权限、正确选择工具、控制仓位、遇到执行异常时停止盲目重试，并留下可审计的理由。AI Trading DMV 不要求 Agent 公开自己的内部实现，而是把它当作黑箱，只看它在动态市场题里的输入输出。系统给 Agent 一张 License Card 和一段 3 分钟市场窗口题，Agent 必须提交结构化 answer sheet，包括 tool calls、final action、order intent、human confirmation 标记和 reason。考官用隐藏规则批改行为轨迹，最后给出 `Suspended`、`L1 Paper Trader`、`L2 Assisted Spot Trader` 等权限结果。

### 第二段 · 完成度

当前已经完成本地 Web Demo、4 个模拟候选 Agent、5 个动态市场窗口、结构化答题格式、隐藏批改规则、可审计行为报告、分项评分、License 结果弹窗，以及外部 Agent 答案评估 API。开发过程中最大的难点是避免把项目做成“假交易机器人”，所以我们把边界放在实盘前：本项目不连接真实 Bitget 账户、不使用真实 API key、不真实下单，只评估 Agent 的权限边界、风控纪律、工具调用安全和执行可靠性。当前尚未实现公开部署、真实 Bitget Agent Hub 适配器、真实账户连接和真实订单执行。下一步可以接入 Bitget Agent Hub / MCP Server / Skill Hub，让真实交易 Agent 在获得交易权限前先通过 DMV 沙盒路测。

### 第三段 · 对 AI Trading 的看法

Agentic Trading 不只是让 AI 生成策略或调用下单工具，更关键的是建立可托管的操作信任。一个可用的交易 Agent 不应该只说“我想买入”，它还要证明这次操作在权限范围内、仓位合理、工具调用正确、需要人工确认时没有绕过确认，并且每一步都有可审计理由。AI Trading DMV 想补的是这层基础设施：在真实资金之前，先判断 Agent 是否具备进入模拟盘、纸面交易或受限实盘权限的资格。

### 第四段 · 提交材料

- GitHub 仓库：`TODO: 填公开 GitHub 链接`
- 可核查使用记录：`examples/demo-run-log.md`
- 样本输入输出：`examples/external-safe-answer.json`、`examples/unauditable-answer.json`、`examples/sample-results.json`
- 演示视频：`TODO: 如录制公开视频，则填链接`

## Project Description

AI Trading DMV is a sandbox road test for AI trading agents before they receive trading permissions. The problem is not that agents lack market data or tool access; platforms can already provide those. The missing layer is permission judgment: can the agent stay inside its license, choose the right tools, control risk, avoid blind execution, and leave an auditable reason when the market is moving fast? AI Trading DMV treats each trading agent as a black box. The agent receives a license card and dynamic market-window exam prompts, then submits a structured answer sheet. The examiner checks the answer trace and issues a license level such as `Suspended`, `L1 Paper Trader`, or `L2 Assisted Spot Trader`.

The current demo includes a local web console, four simulated candidate agents, five dynamic market windows, structured answer grading, auditability checks, hidden examiner rubrics, score breakdowns, license results, and an external answer evaluation API. The main development challenge was making the product understandable without turning it into a fake trading bot. The solution is to keep the system before execution: no real Bitget account, no real API key, and no real orders. What is not implemented yet: public deployment, real Bitget Agent Hub adapter, real account connection, and real order execution. The project uses Node.js, a local web UI, and automated Node tests. If integrated with Bitget tools later, AI Trading DMV can sit between Agent Hub / MCP Server / Skill Hub agents and live trading permissions as a pre-live qualification gate.

## View On AI Trading

Agentic trading needs more than strategy generation. The hard part is operational trust: permission boundaries, audit trails, tool-call safety, and recovery from execution uncertainty. A useful trading agent should not only say what it wants to do; it should prove that the action is allowed, sized correctly, explainable, and safe to execute. AI Trading DMV is a small version of that infrastructure layer.

## Submission Links Checklist

- GitHub repository: `TODO: add public GitHub URL`
- Verifiable usage record: `examples/demo-run-log.md`
- Sample input and output files: `examples/external-safe-answer.json`, `examples/unauditable-answer.json`, `examples/sample-results.json`
- Optional demo video: `TODO: add public video URL if recorded`
