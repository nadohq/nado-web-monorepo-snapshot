import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { Icons, TextButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useTranslation } from 'react-i18next';

interface Props {
  estimatedSlippageFraction: BigNumber | undefined;
  maxSlippageFraction: number;
}

export function OrderSlippageMetricValue({
  estimatedSlippageFraction,
  maxSlippageFraction,
}: Props) {
  const { t } = useTranslation();

  const { show } = useDialog();

  // Show a warning if estimated slippage is greater than 80% of max slippage
  const shouldShowSlippageWarning =
    estimatedSlippageFraction?.gt(maxSlippageFraction * 0.8) ?? false;

  return (
    <TextButton
      className="gap-x-0.5"
      onClick={() => show({ type: 'settings', params: {} })}
      colorVariant="accent"
      endIcon={<Icons.NotePencil />}
    >
      <span className={shouldShowSlippageWarning ? 'text-warning' : ''}>
        <span className="label-separator">{t(($) => $.estimatedAbbrev)}</span>{' '}
        {formatNumber(estimatedSlippageFraction, {
          formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
        })}
      </span>
      {' / '}
      <span className="label-separator">{t(($) => $.maxAbbrev)}</span>{' '}
      {formatNumber(maxSlippageFraction, {
        formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
      })}
    </TextButton>
  );
}
