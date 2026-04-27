import { WithClassnames } from '@nadohq/web-common';
import { Switch } from '@nadohq/web-ui';
import { SwitchLabelWithTooltip } from 'client/components/SwitchLabelWithTooltip';
import { useTranslation } from 'react-i18next';

interface Props {
  enableBorrows: boolean;
  onEnableBorrowsChange(enabled: boolean): void;
}

export function EnableBorrowsSwitch({
  enableBorrows,
  onEnableBorrowsChange,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  return (
    <Switch.Row>
      <SwitchLabelWithTooltip
        id="enable-borrowing"
        definitionId="enableBorrowsSwitch"
      >
        {t(($) => $.buttons.enableBorrowing)}
      </SwitchLabelWithTooltip>
      <Switch.Toggle
        id="enable-borrowing"
        checked={enableBorrows}
        onCheckedChange={onEnableBorrowsChange}
      />
    </Switch.Row>
  );
}
