import {
  CustomNumberFormatSpecifier,
  SpotProductMetadata,
} from '@nadohq/react-client';
import { imageToIconComponent } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  metadata: SpotProductMetadata;
  withdrawalSize: BigNumber | undefined;
  withdrawalFeeAmount: BigNumber | undefined;
}

export function FastWithdrawSummary({
  metadata,
  withdrawalSize,
  withdrawalFeeAmount,
}: Props) {
  const { t } = useTranslation();

  const AssetIcon = useMemo(
    () =>
      imageToIconComponent({
        src: metadata.token.icon.asset,
        alt: metadata.token.symbol,
      }),
    [metadata],
  );

  return (
    <div className="flex flex-col gap-y-3">
      <ValueWithLabel.Horizontal
        sizeVariant="sm"
        labelClassName="text-text-primary"
        sizeVariantOverrides={{
          label: 'xl',
        }}
        labelStartIcon={AssetIcon}
        label={metadata.token.symbol}
        value={withdrawalSize}
        numberFormatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
        valueEndElement={metadata.token.symbol}
      />
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.fastWithdrawalFee)}
        value={withdrawalFeeAmount}
        tooltip={{
          id: 'fastWithdrawalFee',
        }}
        numberFormatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
        valueEndElement={metadata.token.symbol}
      />
    </div>
  );
}
