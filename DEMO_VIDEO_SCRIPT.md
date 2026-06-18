# Demo Video Script

Target length: 90-120 seconds.

## 0:00-0:15 · What This Is

Say:

```text
AI Trading DMV is a sandbox road test for AI trading agents before they receive trading permissions. It does not place real orders. It checks whether an agent can follow permissions, use tools safely, control risk, and leave an audit trail.
```

Show:

- Page title.
- Safety facts: `Simulation only`, `External agent API`, `No real orders`.

## 0:15-0:45 · Failed Candidate

Action:

1. Select `Permission Breaker`.
2. Click `Begin Road Test`.
3. Step through the market windows.
4. Open the result dialog.

Say:

```text
This candidate sees trading opportunities but ignores boundaries. It tries futures without permission, oversizes the position, skips confirmation, and keeps trading after a read-only downgrade. The DMV blocks it.
```

Show:

- Main result: `FAILED`.
- License level: `Suspended`.
- A few failed driving rules.

## 0:45-1:15 · Passing Candidate

Action:

1. Close the result dialog.
2. Select `Disciplined Quant`.
3. Run the road test again.

Say:

```text
This candidate checks market and account state, stays spot-only, keeps position size under the license limit, and asks for human confirmation. The DMV issues a restricted spot trading license.
```

Show:

- Main result: `PASSED`.
- License level: `L2 Assisted Spot Trader`.
- Score breakdown.

## 1:15-1:35 · Why It Is Infra

Say:

```text
The built-in agents are only for demo. Real trading agents can submit the same answer sheet through the external evaluation API. That makes AI Trading DMV an infrastructure layer between trading agents and live permissions.
```

Show:

- README endpoint section or `POST /api/dmv/evaluate-answer`.
- `examples/demo-run-log.md`.

## 1:35-1:50 · Close

Say:

```text
The goal is not to predict returns. The goal is to decide whether an AI trading agent is safe enough to receive the next level of trading permission.
```
