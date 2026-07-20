'use client';

import { PrimaryButton } from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useTranslation } from 'react-i18next';

interface Props {
  buttonState: BaseActionButtonState;
  onClick: () => void;
}

export function TradingCompHeaderEnrollButton({ buttonState, onClick }: Props) {
  const { t } = useTranslation();

  const enrollLabel = t(($) => $.tradingCompetition.enrollNow);
  const loadingLabel = t(($) => $.tradingCompetition.enrolling);

  const content = {
    idle: enrollLabel,
    loading: loadingLabel,
    disabled: enrollLabel,
    success: (
      <ButtonStateContent.Success
        message={t(($) => $.tradingCompetition.enrolled)}
      />
    ),
  }[buttonState];

  const isLoading = buttonState === 'loading';
  const isDisabled = buttonState === 'disabled' || buttonState === 'success';

  return (
    <PrimaryButton
      onClick={onClick}
      isLoading={isLoading}
      disabled={isDisabled}
    >
      {content}
    </PrimaryButton>
  );
}
