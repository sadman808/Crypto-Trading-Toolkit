
import { TradeParams, CalculationResult, RiskMethod, Direction } from '../types';

export function calculateRisk(params: TradeParams): CalculationResult {
  const {
    accountBalance,
    riskMethod,
    riskPercentage,
    fixedRiskAmount,
    winProbability,
    winLossRatio,
    entryPrice,
    stopLossPrice,
    targetPrice,
    direction,
    leverage,
    symbol,
    accountCurrency
  } = params;

  if (entryPrice <= 0 || stopLossPrice <= 0 || accountBalance <= 0) {
      throw new Error("Account Balance, Entry Price, and Stop-Loss Price must be positive numbers.");
  }
  
  // Calculate risk amount in fiat
  let riskAmount = 0;
  switch (riskMethod) {
    case RiskMethod.FixedPercentage:
      riskAmount = accountBalance * (riskPercentage / 100);
      break;
    case RiskMethod.FixedAmount:
      riskAmount = fixedRiskAmount;
      break;
    case RiskMethod.KellyCriterion:
      const winProb = winProbability / 100;
      if (winProb <= 0 || winLossRatio <= 0) {
        throw new Error("For Kelly Criterion, Win Probability and Win/Loss Ratio must be positive.");
      }
      const kellyFraction = winProb - (1 - winProb) / winLossRatio;
      if (kellyFraction <= 0) {
        throw new Error("Kelly Criterion suggests not taking this trade (fraction is zero or negative).");
      }
      riskAmount = accountBalance * kellyFraction;
      break;
  }
  
  if (riskAmount > accountBalance) {
      throw new Error("Risk amount cannot be greater than the account balance.");
  }
  if (riskAmount <= 0) {
      throw new Error("Calculated risk amount must be positive.");
  }

  // Calculate stop loss distance
  const stopLossDistance = direction === Direction.Long
    ? entryPrice - stopLossPrice
    : stopLossPrice - entryPrice;

  if (stopLossDistance <= 0) {
    throw new Error("Stop-Loss price creates a zero or negative risk distance. For Long, SL must be below Entry. For Short, SL must be above Entry.");
  }
  
  const targetDistance = direction === Direction.Long
    ? targetPrice - entryPrice
    : entryPrice - targetPrice;

  if (targetPrice <= 0 || targetDistance <= 0) {
      throw new Error("Target price must be positive and in the profitable direction of the trade.");
  }

  // Calculate position size
  const positionSizeAsset = riskAmount / stopLossDistance;
  const positionSizeFiat = positionSizeAsset * entryPrice;
  const notionalValue = positionSizeFiat * leverage;
  const maxLossPercent = (riskAmount / accountBalance) * 100;
  const rewardRiskRatio = targetDistance / stopLossDistance;
  
  const assetName = symbol.split('/')[0] || 'Asset';

  // Calculate take profit levels
  const takeProfitLevels = [1.5, 2, 3].map(rr => {
    const profitDistance = stopLossDistance * rr;
    const price = direction === Direction.Long
      ? entryPrice + profitDistance
      : entryPrice - profitDistance;
    const profit = positionSizeAsset * profitDistance;
    return { rr, price, profit };
  });

  return {
    positionSizeAsset,
    positionSizeFiat,
    notionalValue,
    maxLossFiat: riskAmount,
    maxLossPercent,
    rewardRiskRatio,
    takeProfitLevels,
    assetName,
    accountCurrency
  };
}
