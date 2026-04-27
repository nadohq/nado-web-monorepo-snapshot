// TP/SL input types
export interface TakeProfitInput {
  gain?: string;
  triggerPrice?: string;
}

export interface StopLossInput {
  loss?: string;
  triggerPrice?: string;
}

export interface TpSlInput {
  tp?: TakeProfitInput;
  sl?: StopLossInput;
}
