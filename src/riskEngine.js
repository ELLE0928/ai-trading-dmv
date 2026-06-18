export const RISK_PROFILES = {
  Conservative: {
    maxLeverage: 3,
    maxPositionPct: 5,
    maxCapitalRiskPct: 0.5,
    missingStopLossDecision: "BLOCK",
    repeatedRiskPenalty: 20
  },
  Balanced: {
    maxLeverage: 8,
    maxPositionPct: 15,
    maxCapitalRiskPct: 1.5,
    missingStopLossDecision: "WARN",
    repeatedRiskPenalty: 15
  },
  Aggressive: {
    maxLeverage: 20,
    maxPositionPct: 30,
    maxCapitalRiskPct: 3,
    missingStopLossDecision: "WARN",
    repeatedRiskPenalty: 10
  }
};

const REQUIRED_FIELDS = [
  "agent_id",
  "symbol",
  "market_type",
  "side",
  "order_type",
  "position_size_pct"
];

const VALID_MARKETS = new Set(["spot", "futures"]);
const VALID_SIDES = new Set(["buy", "sell", "long", "short"]);
const VALID_ORDER_TYPES = new Set(["market", "limit"]);
const VALID_RISK_PROFILES = new Set(Object.keys(RISK_PROFILES));

export function normalizeTradePlan(input = {}) {
  const riskProfile = input.risk_profile || input.riskProfile || "Balanced";
  return {
    agent_id: stringOrEmpty(input.agent_id),
    risk_profile: VALID_RISK_PROFILES.has(riskProfile) ? riskProfile : "Balanced",
    symbol: stringOrEmpty(input.symbol).toUpperCase(),
    market_type: stringOrEmpty(input.market_type).toLowerCase(),
    side: stringOrEmpty(input.side).toLowerCase(),
    order_type: stringOrEmpty(input.order_type).toLowerCase(),
    position_size_pct: toNumber(input.position_size_pct),
    leverage: input.leverage === undefined || input.leverage === null || input.leverage === ""
      ? undefined
      : toNumber(input.leverage),
    stop_loss_pct: input.stop_loss_pct === undefined || input.stop_loss_pct === null || input.stop_loss_pct === ""
      ? undefined
      : toNumber(input.stop_loss_pct),
    take_profit_pct: input.take_profit_pct === undefined || input.take_profit_pct === null || input.take_profit_pct === ""
      ? undefined
      : toNumber(input.take_profit_pct),
    entry_price: input.entry_price === undefined || input.entry_price === null || input.entry_price === ""
      ? undefined
      : toNumber(input.entry_price),
    reason: stringOrEmpty(input.reason),
    confidence: input.confidence === undefined || input.confidence === null || input.confidence === ""
      ? undefined
      : toNumber(input.confidence)
  };
}

export function evaluateTrade(planInput, existingProfile) {
  const plan = normalizeTradePlan(planInput);
  const thresholds = RISK_PROFILES[plan.risk_profile];
  const triggered = [];
  const suggestions = [];
  let score = 0;
  let forcedDecision = null;

  for (const field of REQUIRED_FIELDS) {
    if (plan[field] === "" || plan[field] === undefined || Number.isNaN(plan[field])) {
      triggered.push(`MISSING_${field.toUpperCase()}`);
      suggestions.push(`Provide ${field} before checking the trade.`);
      forcedDecision = "BLOCK";
      score += 35;
    }
  }

  if (!VALID_MARKETS.has(plan.market_type)) {
    triggered.push("INVALID_MARKET_TYPE");
    suggestions.push("Use market_type spot or futures.");
    forcedDecision = "BLOCK";
    score += 30;
  }

  if (!VALID_SIDES.has(plan.side)) {
    triggered.push("INVALID_SIDE");
    suggestions.push("Use side buy, sell, long, or short.");
    forcedDecision = "BLOCK";
    score += 30;
  }

  if (!VALID_ORDER_TYPES.has(plan.order_type)) {
    triggered.push("INVALID_ORDER_TYPE");
    suggestions.push("Use order_type market or limit.");
    forcedDecision = "BLOCK";
    score += 30;
  }

  if (!isPositiveNumber(plan.position_size_pct)) {
    triggered.push("INVALID_POSITION_SIZE");
    suggestions.push("Set position_size_pct to a positive number.");
    forcedDecision = "BLOCK";
    score += 35;
  }

  if (plan.market_type === "futures" && !isPositiveNumber(plan.leverage)) {
    triggered.push("FUTURES_LEVERAGE_REQUIRED");
    suggestions.push("Provide leverage for futures trades.");
    forcedDecision = "BLOCK";
    score += 35;
  }

  const leverage = plan.market_type === "spot" ? 1 : plan.leverage;

  if (isPositiveNumber(plan.position_size_pct) && plan.position_size_pct > 60) {
    triggered.push("HARD_POSITION_LIMIT");
    suggestions.push("Reduce position size to 60% or less.");
    forcedDecision = "BLOCK";
    score += 60;
  } else if (isPositiveNumber(plan.position_size_pct) && plan.position_size_pct > thresholds.maxPositionPct) {
    triggered.push("PROFILE_POSITION_LIMIT");
    suggestions.push(`For ${plan.risk_profile} agents, keep position size at or below ${thresholds.maxPositionPct}%.`);
    score += overageScore(plan.position_size_pct, thresholds.maxPositionPct, 20);
  }

  if (isPositiveNumber(leverage) && leverage > 50) {
    triggered.push("HARD_LEVERAGE_LIMIT");
    suggestions.push("Reduce leverage to 50x or less.");
    forcedDecision = "BLOCK";
    score += 60;
  } else if (isPositiveNumber(leverage) && leverage > thresholds.maxLeverage) {
    triggered.push("PROFILE_LEVERAGE_LIMIT");
    suggestions.push(`For ${plan.risk_profile} agents, keep leverage at or below ${thresholds.maxLeverage}x.`);
    score += overageScore(leverage, thresholds.maxLeverage, 18);
  }

  if (!isPositiveNumber(plan.stop_loss_pct)) {
    triggered.push("MISSING_STOP_LOSS");
    suggestions.push("Add a stop-loss before execution.");
    score += plan.risk_profile === "Conservative" ? 45 : 25;
    if (thresholds.missingStopLossDecision === "BLOCK") {
      forcedDecision = "BLOCK";
    } else {
      forcedDecision = maxDecision(forcedDecision, "WARN");
    }
  } else {
    const capitalRiskPct = plan.position_size_pct * (leverage || 1) * plan.stop_loss_pct / 100;
    if (capitalRiskPct > thresholds.maxCapitalRiskPct) {
      triggered.push("PROFILE_CAPITAL_RISK_LIMIT");
      suggestions.push(`Reduce position, leverage, or stop-loss distance to keep capital risk below ${thresholds.maxCapitalRiskPct}%.`);
      score += overageScore(capitalRiskPct, thresholds.maxCapitalRiskPct, 22);
    }
  }

  if (!plan.reason) {
    triggered.push("LOW_AUDIT_CONTEXT");
    suggestions.push("Optional: add reason to improve audit quality.");
    score += 4;
  }

  if (
    !isPositiveNumber(plan.stop_loss_pct) &&
    isPositiveNumber(plan.position_size_pct) &&
    plan.position_size_pct > thresholds.maxPositionPct &&
    isPositiveNumber(leverage) &&
    leverage >= thresholds.maxLeverage
  ) {
    triggered.push("COMPOUNDED_POSITION_LEVERAGE_NO_STOP");
    suggestions.push("Reduce leverage and position size, then add a stop-loss before execution.");
    forcedDecision = "BLOCK";
    score += 25;
  }

  if (existingProfile) {
    const recentRiskCount = existingProfile.blocked_count + existingProfile.warned_count;
    if (recentRiskCount >= 3) {
      triggered.push("REPEATED_RISK_HISTORY");
      suggestions.push("Review this agent's recent risky behavior before increasing permissions.");
      score += thresholds.repeatedRiskPenalty;
    }
    if (existingProfile.missing_stop_loss_count >= 3 && !isPositiveNumber(plan.stop_loss_pct)) {
      triggered.push("REPEATED_MISSING_STOP_LOSS");
      suggestions.push("This agent repeatedly omits stop-losses; consider lowering its risk profile.");
      score += thresholds.repeatedRiskPenalty;
    }
  }

  score = Math.min(100, Math.round(score));
  const decision = forcedDecision || decisionFromScore(score);

  return {
    plan,
    decision,
    risk_score: score,
    triggered_rules: dedupe(triggered),
    explanation: buildExplanation(decision, triggered, plan.risk_profile),
    suggestions: dedupe(suggestions)
  };
}

export function createInitialProfile(agentId, riskProfile = "Balanced") {
  return {
    agent_id: agentId,
    risk_profile: riskProfile,
    total_trades: 0,
    approved_count: 0,
    warned_count: 0,
    blocked_count: 0,
    high_leverage_count: 0,
    missing_stop_loss_count: 0,
    oversized_position_count: 0,
    current_risk_level: "LOW"
  };
}

export function updateProfile(profile, plan, decision) {
  const next = { ...profile, risk_profile: plan.risk_profile };
  next.total_trades += 1;
  if (decision === "APPROVE") next.approved_count += 1;
  if (decision === "WARN") next.warned_count += 1;
  if (decision === "BLOCK") next.blocked_count += 1;
  const leverage = plan.market_type === "spot" ? 1 : plan.leverage;
  const thresholds = RISK_PROFILES[plan.risk_profile];
  if (isPositiveNumber(leverage) && leverage > thresholds.maxLeverage) next.high_leverage_count += 1;
  if (!isPositiveNumber(plan.stop_loss_pct)) next.missing_stop_loss_count += 1;
  if (isPositiveNumber(plan.position_size_pct) && plan.position_size_pct > thresholds.maxPositionPct) {
    next.oversized_position_count += 1;
  }
  next.current_risk_level = currentRiskLevel(next);
  return next;
}

function currentRiskLevel(profile) {
  if (profile.blocked_count >= 3 || profile.missing_stop_loss_count >= 4) return "HIGH";
  if (profile.blocked_count >= 1 || profile.warned_count + profile.blocked_count >= 2 || profile.high_leverage_count >= 2) return "MEDIUM";
  return "LOW";
}

function buildExplanation(decision, triggered, riskProfile) {
  if (!triggered.length && decision === "APPROVE") {
    return `Approved because this trade stays within the ${riskProfile} risk profile.`;
  }
  const shortRules = dedupe(triggered).map((rule) => rule.toLowerCase().replaceAll("_", " ")).join(", ");
  if (decision === "BLOCK") return `Blocked because ${shortRules}.`;
  if (decision === "WARN") return `Warned because ${shortRules}.`;
  return `Approved with audit notes: ${shortRules}.`;
}

function decisionFromScore(score) {
  if (score >= 70) return "BLOCK";
  if (score >= 40) return "WARN";
  return "APPROVE";
}

function maxDecision(current, candidate) {
  const weight = { APPROVE: 0, WARN: 1, BLOCK: 2 };
  if (!current) return candidate;
  return weight[candidate] > weight[current] ? candidate : current;
}

function overageScore(value, limit, base) {
  const ratio = value / limit;
  if (ratio >= 3) return base + 30;
  if (ratio >= 2) return base + 18;
  if (ratio >= 1.25) return base + 8;
  return base;
}

function stringOrEmpty(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function isPositiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function dedupe(items) {
  return [...new Set(items)];
}
