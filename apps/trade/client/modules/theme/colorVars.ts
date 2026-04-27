import {
  BASE_COLOR_VARS,
  getColorVar,
  GetColorVarParams,
} from '@nadohq/web-ui';

export const COLOR_VARS = {
  ...BASE_COLOR_VARS,
  'accent-alt': '--color-accent-alt',
  'accent-info': '--color-accent-info',
  'accent-warning': '--color-accent-warning',
  'risk-low': '--color-risk-low',
  'risk-medium': '--color-risk-medium',
  'risk-high': '--color-risk-high',
  'risk-extreme': '--color-risk-extreme',
  'grad-chart-stop': '--color-grad-chart-stop',
} as const;

export type ColorVar = keyof typeof COLOR_VARS;

/**
 * A utility function to get the theme color variable string given a valid color variable name.
 * ex. `getTradeAppColorVar('surface-card')` => `'var(--color-surface-card)'` if `as` is `cssFn`
 * or `getTradeAppColorVar('surface-card')` => `'--color-surface-card'` if `as` is `variable`
 */
export function getTradeAppColorVar(
  colorVarName: ColorVar,
  params?: GetColorVarParams,
) {
  return getColorVar(COLOR_VARS, colorVarName, params);
}

/**
 * A utility function to get the theme color value given a valid CSS variable.
 * This is used when an element does not have access to the root variables. ie. TradingView iframe.
 */
export function getResolvedColorValue(colorVarName: ColorVar) {
  if (typeof document === 'undefined') {
    return '';
  }

  const varName = getTradeAppColorVar(colorVarName, { as: 'variable' });
  const tailwindStyles = getComputedStyle(document.documentElement);

  return tailwindStyles.getPropertyValue(varName);
}
