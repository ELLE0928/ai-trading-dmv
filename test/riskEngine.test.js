import test from "node:test";
import assert from "node:assert/strict";
import { createInitialProfile, evaluateTrade, updateProfile } from "../src/riskEngine.js";

const basePlan = {
  agent_id: "agent_1",
  symbol: "BTCUSDT",
  market_type: "futures",
  side: "long",
  order_type: "market",
  position_size_pct: 3,
  leverage: 2,
  stop_loss_pct: 1
};

test("missing required fields returns BLOCK", () => {
  const result = evaluateTrade({});
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.triggered_rules.includes("MISSING_AGENT_ID"));
});

test("futures trade without leverage returns BLOCK", () => {
  const result = evaluateTrade({ ...basePlan, leverage: undefined });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.triggered_rules.includes("FUTURES_LEVERAGE_REQUIRED"));
});

test("hard safety limit returns BLOCK", () => {
  const result = evaluateTrade({ ...basePlan, position_size_pct: 70 });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.triggered_rules.includes("HARD_POSITION_LIMIT"));
});

test("missing stop-loss depends on risk profile", () => {
  const conservative = evaluateTrade({ ...basePlan, risk_profile: "Conservative", stop_loss_pct: undefined });
  const balanced = evaluateTrade({ ...basePlan, risk_profile: "Balanced", stop_loss_pct: undefined });
  const aggressive = evaluateTrade({ ...basePlan, risk_profile: "Aggressive", stop_loss_pct: undefined });
  assert.equal(conservative.decision, "BLOCK");
  assert.equal(balanced.decision, "WARN");
  assert.equal(aggressive.decision, "WARN");
});

test("reasonable low-risk trade returns APPROVE", () => {
  const result = evaluateTrade({ ...basePlan, risk_profile: "Balanced", reason: "" });
  assert.equal(result.decision, "APPROVE");
});

test("high leverage, large position, no stop-loss returns BLOCK", () => {
  const result = evaluateTrade({
    ...basePlan,
    risk_profile: "Aggressive",
    position_size_pct: 50,
    leverage: 20,
    stop_loss_pct: undefined
  });
  assert.equal(result.decision, "BLOCK");
  assert.ok(result.triggered_rules.includes("PROFILE_POSITION_LIMIT"));
  assert.ok(result.triggered_rules.includes("MISSING_STOP_LOSS"));
});

test("agent profile updates after risky behavior", () => {
  let profile = createInitialProfile("agent_1", "Balanced");
  for (let i = 0; i < 3; i += 1) {
    const result = evaluateTrade({ ...basePlan, risk_profile: "Balanced", leverage: 12, stop_loss_pct: undefined }, profile);
    profile = updateProfile(profile, result.plan, result.decision);
  }
  assert.equal(profile.total_trades, 3);
  assert.ok(profile.warned_count + profile.blocked_count >= 3);
  assert.equal(profile.current_risk_level, "MEDIUM");
});

test("api decision shape contains required fields", () => {
  const result = evaluateTrade(basePlan);
  assert.equal(typeof result.decision, "string");
  assert.equal(typeof result.risk_score, "number");
  assert.ok(Array.isArray(result.triggered_rules));
  assert.equal(typeof result.explanation, "string");
  assert.ok(Array.isArray(result.suggestions));
});
