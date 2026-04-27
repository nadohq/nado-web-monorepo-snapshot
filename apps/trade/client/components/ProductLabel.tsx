import { BaseTestProps, NextImageSrc } from '@nadohq/web-common';
import Image from 'next/image';

interface ProductLabelProps extends BaseTestProps {
  symbol: string;
  iconSrc: NextImageSrc;
}

export function ProductLabel({
  symbol,
  iconSrc,
  dataTestId,
}: ProductLabelProps) {
  return (
    <div className="flex items-center gap-x-2.5">
      <Image className="size-6" src={iconSrc} alt={symbol} />
      <span
        data-testid={dataTestId}
        className="text-text-primary text-xs font-medium"
      >
        {symbol}
      </span>
    </div>
  );
}
