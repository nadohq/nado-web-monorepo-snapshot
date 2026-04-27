import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { PrimaryButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  state: BaseActionButtonState;
  progressFrac: number;
  onClick: () => void;
}

export function ExportHistorySubmitButton({
  state,
  progressFrac,
  onClick,
  className,
}: Props) {
  const { t } = useTranslation();

  const formattedProgressPercentage = formatNumber(progressFrac, {
    formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_INT,
  });
  const message = {
    loading: t(($) => $.preparingDataProgressIndicator, {
      progress: formattedProgressPercentage,
    }),
    success: (
      <ButtonStateContent.Success message={t(($) => $.exportComplete)} />
    ),
    idle: t(($) => $.buttons.export),
    disabled: t(($) => $.buttons.export),
  }[state];

  return (
    <PrimaryButton
      className={className}
      isLoading={state === 'loading'}
      disabled={state === 'disabled'}
      onClick={onClick}
    >
      {message}
    </PrimaryButton>
  );
}
