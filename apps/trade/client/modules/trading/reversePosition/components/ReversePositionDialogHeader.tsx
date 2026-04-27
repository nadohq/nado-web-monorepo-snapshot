import { Pill } from '@nadohq/web-ui';
import { PerpPositionItem } from 'client/hooks/subaccount/usePerpPositions';
import { formatLeverage } from 'client/utils/formatLeverage';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface ReversePositionDialogHeaderProps {
  position: PerpPositionItem | undefined;
  isCurrentlyLong: boolean;
}

export function ReversePositionDialogHeader({
  position,
  isCurrentlyLong,
}: ReversePositionDialogHeaderProps) {
  const { t } = useTranslation();

  const metadata = position?.metadata;
  const marginMode = position?.iso ? t(($) => $.isolated) : t(($) => $.cross);
  const leverage = position?.iso?.leverage;

  const longPill = (
    <Pill
      colorVariant="positive"
      sizeVariant="xs"
      dataTestId="reverse-position-dialog-long-pill"
    >
      {t(($) => $.long)}
    </Pill>
  );
  const shortPill = (
    <Pill
      colorVariant="negative"
      sizeVariant="xs"
      dataTestId="reverse-position-dialog-short-pill"
    >
      {t(($) => $.short)}
    </Pill>
  );
  const fromSidePill = isCurrentlyLong ? longPill : shortPill;
  const toSidePill = isCurrentlyLong ? shortPill : longPill;

  return (
    <div className="flex items-center justify-between gap-x-4">
      {/* Left side: Icon, Symbol, Perp badge, Margin info */}
      <div className="flex items-center gap-x-3">
        {metadata?.icon && (
          <Image
            src={metadata.icon.asset}
            alt={metadata.symbol ?? ''}
            className="size-8"
          />
        )}
        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center gap-x-1.5">
            <div
              className="text-text-primary text-sm"
              data-testid="reverse-position-dialog-market-name"
            >
              {metadata?.marketName ?? ''}
            </div>
          </div>
          <div
            className="text-text-tertiary text-xs"
            data-testid="reverse-position-dialog-margin-mode"
          >
            {marginMode}
            {leverage && ` ${formatLeverage(leverage)}`}
          </div>
        </div>
      </div>

      {/* Right side: Direction indicator (Long → Short or Short → Long) */}
      <div
        className="flex items-center gap-x-1"
        data-testid="reverse-position-dialog-direction-indicator"
      >
        {fromSidePill} ➞ {toSidePill}
      </div>
    </div>
  );
}
