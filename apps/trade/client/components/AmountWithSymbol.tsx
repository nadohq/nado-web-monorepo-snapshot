import {
  BaseTestProps,
  mergeClassNames,
  WithClassnames,
} from '@nadohq/web-common';

interface Props extends WithClassnames, BaseTestProps {
  formattedAmount: string;
  symbol: string | undefined;
}

export function AmountWithSymbol({
  className,
  formattedAmount,
  symbol,
  dataTestId,
}: Props) {
  return (
    <div
      className={mergeClassNames('flex items-baseline gap-x-1', className)}
      data-testid={dataTestId}
    >
      {formattedAmount}
      <div className="empty:hidden">{symbol ?? ''}</div>
    </div>
  );
}
