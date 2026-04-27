import { PrimaryButton } from '@nadohq/web-ui';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { usePerpLeverageDialog } from 'client/pages/PerpTrading/components/PerpLeverageDialog/hooks/usePerpLeverageDialog';
import { LeverageInput } from 'client/pages/PerpTrading/components/PerpLeverageDialog/LeverageInput';
import { PerpLeverageSlider } from 'client/pages/PerpTrading/components/PerpLeverageDialog/PerpLeverageSlider';
import { Trans, useTranslation } from 'react-i18next';

export interface PerpLeverageDialogParams {
  productId: number;
}

export function PerpLeverageDialog({ productId }: PerpLeverageDialogParams) {
  const { t } = useTranslation();

  const {
    hide,
    minLeverage,
    maxLeverage,
    currentMarket,
    leverageSliderValue,
    leverageAmountInputRegister,
    form: { setValue },
    onSliderValueChange,
    onSubmit,
    buttonState,
    leverageAmountError,
    leverageIncrement,
    marginModeType,
  } = usePerpLeverageDialog({ productId });
  if (!currentMarket) {
    return null;
  }

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.adjustLeverage)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <form onSubmit={onSubmit}>
          <LeverageInput
            leverageAmountInputRegister={leverageAmountInputRegister}
            setValue={setValue}
            leverageAmountError={leverageAmountError}
            leverageIncrement={leverageIncrement}
          />
          <PerpLeverageSlider
            minLeverage={minLeverage}
            maxLeverage={maxLeverage}
            leverageIncrement={leverageIncrement}
            value={leverageSliderValue}
            onValueChange={onSliderValueChange}
          />
          <div className="flex flex-col gap-y-2 text-xs">
            {marginModeType === 'isolated' && (
              <p>{t(($) => $.leverageAdjustmentNotice.isolated)}</p>
            )}
            {marginModeType === 'cross' && (
              <>
                <p>
                  <Trans
                    i18nKey={($) => $.leverageAdjustmentNotice.crossRisk}
                    components={{
                      highlight: <span className="text-text-primary" />,
                    }}
                  />
                </p>
                <p>{t(($) => $.leverageAdjustmentNotice.crossEffect)}</p>
              </>
            )}
          </div>
          <PrimaryButton
            disabled={buttonState !== 'idle'}
            type="submit"
            dataTestId="perp-leverage-dialog-confirm-button"
          >
            {t(($) => $.buttons.confirm)}
          </PrimaryButton>
        </form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
