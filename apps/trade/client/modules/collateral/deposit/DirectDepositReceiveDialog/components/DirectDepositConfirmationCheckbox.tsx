import { Checkbox } from '@nadohq/web-ui';
import { Trans, useTranslation } from 'react-i18next';

interface DepositConfirmationCheckboxProps {
  /** The blockchain network name to display */
  chainName: string;
  /** Controlled checked state */
  checked: boolean;
  /** Callback when checked state changes */
  onCheckedChange: (checked: boolean) => void;
  selectedProductSymbol: string | undefined;
}

const ID = 'deposit-confirmation';

export function DirectDepositConfirmationCheckbox({
  chainName,
  checked,
  onCheckedChange,
  selectedProductSymbol,
}: DepositConfirmationCheckboxProps) {
  const { t } = useTranslation();

  return (
    <Checkbox.Row className="items-start">
      <Checkbox.Check
        className="mt-[3px]"
        id={ID}
        sizeVariant="xs"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Checkbox.Label id={ID} sizeVariant="xs" className="leading-normal">
        <Trans
          i18nKey={($) => $.directDepositConfirmation}
          values={{
            productSymbol: selectedProductSymbol ?? t(($) => $.supportedAssets),
            chainName,
          }}
          components={{
            underline: <span className="underline" />,
          }}
        />
      </Checkbox.Label>
    </Checkbox.Row>
  );
}
