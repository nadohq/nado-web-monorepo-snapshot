// We can't use Image element from nextjs here. It won't generate images properly.
/* eslint-disable @next/next/no-img-element */
import {
  CustomNumberFormatSpecifier,
  formatNumber,
  getMarketPriceFormatSpecifier,
  NumberFormatValue,
  PresetNumberFormatSpecifier,
  signDependentValue,
} from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import perpPnlNegativeBg from 'client/modules/trading/perpPnlSocialSharing/assets/perp-pnl-negative-bg.jpg';
import perpPnlPositiveBg from 'client/modules/trading/perpPnlSocialSharing/assets/perp-pnl-positive-bg.jpg';
import { formatLeverage } from 'client/utils/formatLeverage';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type PerpPnlDisplayType = 'usd' | 'frac';

interface Props extends WithClassnames {
  onReady(): void;
  amountForSide: BigNumber;
  pnlFrac: BigNumber;
  pnlUsd: BigNumber;
  pnlDisplayType: PerpPnlDisplayType;
  entryPrice: BigNumber;
  referencePrice: BigNumber;
  /** Label for the reference price */
  referencePriceLabel: string;
  marginModeType: MarginModeType;
  baseUrl: string | undefined;
  isoLeverage: number | null;
  productSymbol: string | undefined;
  priceIncrement: BigNumber | undefined;
}

export function PerpPnlSharingPreview({
  className,
  onReady,
  amountForSide,
  pnlFrac,
  pnlUsd,
  pnlDisplayType,
  entryPrice,
  referencePrice,
  referencePriceLabel,
  marginModeType,
  baseUrl,
  isoLeverage,
  productSymbol,
  priceIncrement,
}: Props) {
  const { t } = useTranslation();
  const priceFormatSpecifier = getMarketPriceFormatSpecifier(priceIncrement);

  const isPositivePnl = pnlFrac.isPositive();
  const backgroundImage = isPositivePnl ? perpPnlPositiveBg : perpPnlNegativeBg;

  // Strip protocol for display.
  const displayUrl = useMemo(() => {
    if (!baseUrl) return '';

    return baseUrl.replace(/^https?:\/\//, '');
  }, [baseUrl]);

  return (
    <div
      className={joinClassNames(
        'relative',
        'flex flex-col gap-y-3.5 sm:gap-y-4',
        'overflow-hidden p-2.5 sm:p-3.5',
        'font-brand',
        className,
      )}
    >
      {/* Background image */}
      <img
        className="absolute inset-0 -z-10 object-cover"
        onLoad={onReady}
        src={backgroundImage.src}
        alt={t(($) => $.imageAltText.socialSharingBackground)}
      />
      {/* Content */}
      {/* Top section - Asset info */}
      <AssetInfo
        symbol={productSymbol}
        amountForSide={amountForSide}
        isoLeverage={isoLeverage}
        marginModeType={marginModeType}
      />
      {/* Middle section - Prices */}
      <ValueWithLabel
        label={t(($) => $.entryPrice)}
        value={entryPrice}
        formatSpecifier={priceFormatSpecifier}
      />
      <ValueWithLabel
        label={referencePriceLabel}
        value={referencePrice}
        formatSpecifier={priceFormatSpecifier}
      />
      <div className="mt-auto flex flex-col gap-y-2 sm:gap-y-6.5">
        <div className="font-brand-mono text-[7px] uppercase sm:text-[8px]">
          {displayUrl}
        </div>
        <PnlDisplay
          pnlUsd={pnlUsd}
          pnlFrac={pnlFrac}
          pnlDisplayType={pnlDisplayType}
        />
      </div>
    </div>
  );
}

interface AssetInfoProps {
  symbol: string | undefined;
  amountForSide: BigNumber;
  isoLeverage: number | null;
  marginModeType: MarginModeType;
}

function AssetInfo({
  symbol,
  amountForSide,
  isoLeverage,
  marginModeType,
}: AssetInfoProps) {
  const { t } = useTranslation();

  const positionSide = signDependentValue(amountForSide, {
    positive: t(($) => $.long),
    negative: t(($) => $.short),
    zero: '-',
  });

  return (
    <div className="flex flex-col gap-y-0.5">
      <div
        className={joinClassNames(
          'text-text-primary text-3xl leading-none sm:text-4xl',
        )}
      >
        {symbol ?? ''}
      </div>
      <div
        className={joinClassNames(
          'flex items-center gap-x-1',
          'text-[6px] uppercase sm:text-[8px]',
        )}
      >
        <div className="bg-text-primary text-background font-brand-mono px-0.5">
          {t(($) => $.perp)}
        </div>
        <div
          className={joinClassNames(
            signDependentValue(amountForSide, {
              positive: 'text-positive',
              negative: 'text-negative',
              zero: 'text-text-tertiary',
            }),
          )}
        >
          <span className="uppercase">{positionSide}</span>
          {isoLeverage ? ` ${formatLeverage(isoLeverage)} ` : ' '}
          {marginModeType}
        </div>
      </div>
    </div>
  );
}

interface PnlDisplayProps extends WithClassnames {
  pnlUsd: BigNumber;
  pnlFrac: BigNumber;
  pnlDisplayType: PerpPnlDisplayType;
}

function PnlDisplay({ pnlUsd, pnlFrac, pnlDisplayType }: PnlDisplayProps) {
  const { value: pnlValue, formatSpecifier: pnlValueFormatSpecifier } =
    useMemo(() => {
      if (pnlDisplayType === 'usd') {
        return {
          value: pnlUsd,
          formatSpecifier: CustomNumberFormatSpecifier.SIGNED_CURRENCY_INT,
        };
      }
      return {
        value: pnlFrac,
        formatSpecifier: PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP,
      };
    }, [pnlDisplayType, pnlUsd, pnlFrac]);

  return (
    <div
      className={joinClassNames(
        'text-[3rem] leading-16 tracking-tight sm:text-[4rem]',
        getSignDependentColorClassName(pnlValue),
      )}
    >
      {formatNumber(pnlValue, {
        formatSpecifier: pnlValueFormatSpecifier,
      })}
    </div>
  );
}

function ValueWithLabel({
  label,
  value,
  formatSpecifier,
}: {
  label: string;
  value: NumberFormatValue;
  formatSpecifier: string;
}) {
  const valueContent = formatNumber(value, {
    formatSpecifier,
  });

  return (
    <div className="flex flex-col items-start gap-y-0.5">
      <div
        className={joinClassNames(
          'flex items-center gap-x-1',
          'px-0.5',
          'bg-text-primary',
        )}
      >
        <span className="bg-background h-1 w-1" />
        <span className="text-background font-brand-mono text-[6px] uppercase sm:text-[7px]">
          {label}
        </span>
      </div>
      <div className="text-text-primary text-[20px] leading-none font-medium sm:text-[25px]">
        {valueContent}
      </div>
    </div>
  );
}
