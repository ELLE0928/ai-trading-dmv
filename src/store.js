import { createInitialProfile, evaluateTrade, updateProfile } from "./riskEngine.js";
import { evaluateExternalAnswer, getDmvCandidates, getDmvTests, runDmvTest } from "./dmvEngine.js";

const state = {
  auditLogs: [],
  profiles: new Map(),
  dmvRuns: []
};

export function checkTrade(input) {
  const agentId = typeof input?.agent_id === "string" && input.agent_id.trim()
    ? input.agent_id.trim()
    : "__unknown_agent__";
  const existing = state.profiles.get(agentId);
  const result = evaluateTrade(input, existing);
  const profile = existing || createInitialProfile(result.plan.agent_id, result.plan.risk_profile);
  const nextProfile = updateProfile(profile, result.plan, result.decision);
  state.profiles.set(result.plan.agent_id, nextProfile);

  const record = {
    id: `trade_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    plan: result.plan,
    decision: result.decision,
    risk_score: result.risk_score,
    triggered_rules: result.triggered_rules,
    explanation: result.explanation,
    suggestions: result.suggestions
  };
  state.auditLogs.unshift(record);
  state.auditLogs = state.auditLogs.slice(0, 50);

  return {
    decision: result.decision,
    risk_score: result.risk_score,
    triggered_rules: result.triggered_rules,
    explanation: result.explanation,
    suggestions: result.suggestions,
    audit_id: record.id,
    profile: nextProfile
  };
}

export function getState() {
  return {
    recent_trades: state.auditLogs,
    profiles: [...state.profiles.values()],
    recent_dmv_runs: state.dmvRuns
  };
}

export function resetState() {
  state.auditLogs = [];
  state.profiles.clear();
  state.dmvRuns = [];
}

export function listDmvCandidates() {
  return getDmvCandidates();
}

export function listDmvTests() {
  return getDmvTests();
}

export function runDmvExam(input) {
  const result = runDmvTest(input);
  state.dmvRuns.unshift(result);
  state.dmvRuns = state.dmvRuns.slice(0, 20);
  return result;
}

export function evaluateDmvAnswer(input) {
  const result = evaluateExternalAnswer(input);
  state.dmvRuns.unshift(result);
  state.dmvRuns = state.dmvRuns.slice(0, 20);
  return result;
}
