import { Checkbox, LinkButton, PrimaryButton } from '@nadohq/web-ui';
import { CheckedState } from '@radix-ui/react-checkbox';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useShowUserDisclosure } from 'client/modules/localstorage/userState/useShowUserDisclosure';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function SpotLeverageOnDialog() {
  const { t } = useTranslation();
  const [hasAcknowledgedRisk, setHasAcknowledgedRisk] = useState(false);
  const { hide } = useDialog();
  const { dismiss: dismissSpotLeverageOnRiskDisclosure } =
    useShowUserDisclosure('spot_leverage_on_risk');

  const onHasAcknowledgedRiskChange = (state: CheckedState) => {
    setHasAcknowledgedRisk(!!state);
  };

  const onConfirm = () => {
    dismissSpotLeverageOnRiskDisclosure();
    hide();
  };

  return (
    <BaseAppDialog.Container>
      <BaseAppDialog.Title>{t(($) => $.spotMargin)}</BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <div className="flex flex-col gap-y-2.5">
          <p>{t(($) => $.spotLeverageDisclaimerText)}</p>
          <p>{t(($) => $.spotLeverageOffDisclaimerText)}</p>
          <p>
            {t(($) => $.checkBoxToContinue)}{' '}
            <LinkButton
              as={Link}
              colorVariant="accent"
              href={LINKS.spotTradingLearnMore}
              external
            >
              {t(($) => $.buttons.learnMore)}
            </LinkButton>{' '}
          </p>
        </div>
        <Checkbox.Row>
          <Checkbox.Check
            id="spot-leverage-disclaimer"
            checked={hasAcknowledgedRisk}
            onCheckedChange={onHasAcknowledgedRiskChange}
            sizeVariant="xs"
          />
          <Checkbox.Label id="spot-leverage-disclaimer" sizeVariant="xs">
            {t(($) => $.riskAcknowledgmentLabel)}
          </Checkbox.Label>
        </Checkbox.Row>
        <PrimaryButton disabled={!hasAcknowledgedRisk} onClick={onConfirm}>
          {t(($) => $.buttons.confirm)}
        </PrimaryButton>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
