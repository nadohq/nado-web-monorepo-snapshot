/**
 * For common linked inputs, amounts can be specified as a fraction of some max amount, or in absolute amount terms
 */
export type LinkedAmountFractionSource = 'absolute' | 'fraction';

/**
 * A base set of form values for forms with linked fraction & amount fields
 */
export interface LinkedAmountFractionFormValues {
  amount: string;
  amountFraction: number;
  amountSource: LinkedAmountFractionSource;
}
