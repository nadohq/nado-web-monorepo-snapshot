import { BigNumber } from 'bignumber.js';

/**
 * Classname object for colors based on risk
 * @param {BigNumber} riskFraction - risk fraction
 */
export function getRiskClassNames(riskFraction: BigNumber | undefined) {
  if (riskFraction?.gte(0.9)) {
    return {
      text: 'text-risk-extreme',
      bg: 'bg-risk-extreme',
      shadow: 'shadow-risk-extreme/50',
    };
  }

  if (riskFraction?.gte(0.7)) {
    return {
      text: 'text-negative',
      bg: 'bg-risk-high',
      shadow: 'shadow-risk-high/50',
    };
  }

  if (riskFraction?.gte(0.4)) {
    return {
      text: 'text-warning',
      bg: 'bg-risk-medium',
      shadow: 'shadow-risk-medium/50',
    };
  }

  return {
    text: 'text-positive',
    bg: 'bg-risk-low',
    shadow: 'shadow-risk-low/50',
  };
}
