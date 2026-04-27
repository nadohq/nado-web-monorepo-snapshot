import { signDependentValue } from '@nadohq/react-client';
import { NextImageSrc, joinClassNames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface Props extends TableCellProps {
  iconSrc: NextImageSrc;
  symbol: string;
  amount: BigNumber;
}

export function SpotBalanceInfoCell({
  symbol,
  iconSrc,
  amount,
  className,
  ...rest
}: Props) {
  const { t } = useTranslation();

  return (
    <TableCell className={joinClassNames('gap-x-2', className)} {...rest}>
      <Image
        src={iconSrc}
        width={24}
        height={24}
        alt={t(($) => $.imageAltText.assetIcon)}
      />
      <div className="flex flex-col gap-y-0.5">
        <span className="font-medium">{symbol}</span>
        <div className="text-text-tertiary text-2xs">
          {signDependentValue(amount, {
            positive: t(($) => $.deposit),
            negative: t(($) => $.borrow),
            zero: '',
          })}
        </div>
      </div>
    </TableCell>
  );
}
