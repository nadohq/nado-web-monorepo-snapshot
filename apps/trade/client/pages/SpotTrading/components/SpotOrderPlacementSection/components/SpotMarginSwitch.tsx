import { WithClassnames } from '@nadohq/web-common';
import { Switch } from '@nadohq/web-ui';
import { SwitchLabelWithTooltip } from 'client/components/SwitchLabelWithTooltip';
import { useSpotLeverageEnabled } from 'client/modules/trading/hooks/useSpotLeverageEnabled';
import { useTranslation } from 'react-i18next';

export function SpotMarginSwitch({ className }: WithClassnames) {
  const { t } = useTranslation();
  const { spotLeverageEnabled, setSpotLeverageEnabled } =
    useSpotLeverageEnabled();

  return (
    <Switch.Row className={className}>
      <SwitchLabelWithTooltip
        className="font-medium"
        id="spot-leverage"
        definitionId="spotLeverageSwitch"
        decoration={{ icon: { size: 14, className: 'text-text-primary' } }}
      >
        {t(($) => $.spotMargin)}
      </SwitchLabelWithTooltip>
      <Switch.Toggle
        id="spot-leverage"
        checked={spotLeverageEnabled}
        onCheckedChange={() => setSpotLeverageEnabled(!spotLeverageEnabled)}
        dataTestId="spot-margin-switch-toggle"
      />
    </Switch.Row>
  );
}
