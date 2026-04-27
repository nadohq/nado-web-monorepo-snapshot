import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { NextImageSrc } from '@nadohq/web-common';
import { Card } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface Props {
  chainName: string;
  chainIcon: NextImageSrc;
  minimumDepositAmount: BigNumber | undefined;
  selectedProductSymbol: string | undefined;
}

export function DirectDepositReceiveInfoCard({
  chainName,
  minimumDepositAmount,
  selectedProductSymbol,
  chainIcon,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className="bg-surface-1 flex flex-col gap-y-3 p-3">
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.chain)}
        valueContent={
          <div className="flex items-center gap-x-1">
            <Image src={chainIcon} alt={chainName} className="size-4" />
            {chainName}
          </div>
        }
      />
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.minimumDeposit)}
        value={minimumDepositAmount}
        numberFormatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
        valueEndElement={selectedProductSymbol}
      />
    </Card>
  );
}
