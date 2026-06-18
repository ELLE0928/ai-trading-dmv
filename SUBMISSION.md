# AI Trading DMV Submission

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
