import { DropdownUi, Icons, PrimaryButton, TextButton } from '@nadohq/web-ui';
import {
  Content as PopoverContent,
  Portal as PopoverPortal,
  Root as PopoverRoot,
  Trigger as PopoverTrigger,
} from '@radix-ui/react-popover';
import { BigNumber } from 'bignumber.js';
import { Form } from 'client/components/Form';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import {
  EditOrderField,
  useEditOrderFieldPopover,
} from 'client/modules/tables/components/EditOrderFieldPopover/useEditOrderFieldPopover';
import { MidPriceButton } from 'client/modules/trading/components/MidPriceButton';
import { useTranslation } from 'react-i18next';

interface Props {
  currentValue: BigNumber;
  productId: number;
  digest: string;
  /** Whether this is a trigger order (stop market, stop limit, TP/SL) */
  isTrigger: boolean;
  /** Which field to modify */
  field: EditOrderField;
  triggerClassName?: string;
  /** Order price used for minimum notional validation (required for amount field) */
  orderPrice: BigNumber | undefined;
}

export function EditOrderFieldPopover({
  currentValue,
  productId,
  digest,
  isTrigger,
  field,
  triggerClassName,
  orderPrice,
}: Props) {
  const { t } = useTranslation();

  const {
    form,
    isOpen,
    onOpenChange,
    isPending,
    isSubmitDisabled,
    errorTooltipContent,
    increment,
    label,
    validateField,
    onSubmit,
    setFieldInput,
  } = useEditOrderFieldPopover({
    currentValue,
    productId,
    digest,
    isTrigger,
    field,
    orderPrice,
  });

  const pricePlaceholder = useNumericInputPlaceholder({ increment });

  // Default to MidPriceButton for price fields
  const isPriceField = field === 'orderPrice' || field === 'triggerPrice';
  const inputEndElement = isPriceField ? (
    <MidPriceButton
      productId={productId}
      priceIncrement={increment}
      setPriceInput={setFieldInput}
    />
  ) : null;

  return (
    <PopoverRoot open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <TextButton
          aria-label={t(($) => $.imageAltText.editOrderField, {
            label: label.toLocaleLowerCase(),
          })}
          colorVariant="secondary"
          className={triggerClassName}
          startIcon={<Icons.PencilSimpleFill />}
        />
      </PopoverTrigger>
      {/* We need a portal here to escape `DataTable` overflow restriction on smaller screens */}
      <PopoverPortal>
        <PopoverContent asChild side="top" align="center" sideOffset={4}>
          <Form onSubmit={onSubmit}>
            <DropdownUi.Content className="flex min-w-48 flex-col lg:gap-y-2">
              <NumberInputWithLabel
                {...form.register('value', { validate: validateField })}
                label={label}
                placeholder={pricePlaceholder}
                disabled={isPending}
                errorTooltipContent={errorTooltipContent}
                step={increment?.toString()}
                endElement={inputEndElement}
              />
              <PrimaryButton
                type="submit"
                size="sm"
                disabled={isSubmitDisabled}
                isLoading={isPending}
              >
                {t(($) => $.buttons.confirm)}
              </PrimaryButton>
            </DropdownUi.Content>
          </Form>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  );
}
