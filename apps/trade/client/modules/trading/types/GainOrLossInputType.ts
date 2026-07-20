/** Available gain/loss input display types for TP/SL orders. */
export const GAIN_OR_LOSS_INPUT_TYPES = ['percentage', 'dollar'] as const;
export type GainOrLossInputType = (typeof GAIN_OR_LOSS_INPUT_TYPES)[number];
