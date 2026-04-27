import { joinClassNames } from '@nadohq/web-common';
import { Checkbox } from '@nadohq/web-ui';
import { CheckboxLabelWithTooltip } from 'client/components/CheckboxLabelWithTooltip';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { TpSlCheckbox } from 'client/modules/trading/components/OrderSettings/components/TpSlSection/TpSlCheckbox';
import { TpSlSection } from 'client/modules/trading/components/OrderSettings/components/TpSlSection/TpSlSection';
import { useOrderSettings } from 'client/modules/trading/components/OrderSettings/hooks/useOrderSettings';
import { useOrderSettingsTimeInForceInDaysErrorTooltipContent } from 'client/modules/trading/components/OrderSettings/hooks/useOrderSettingsTimeInForceInDaysErrorTooltipContent';
import { TimeInForceTypeSelect } from 'client/modules/trading/components/OrderSettings/TimeInForceTypeSelect';
import { UseTpSlOrderForm } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import {
  OrderFormError,
  OrderFormValidators,
} from 'client/modules/trading/types/orderFormTypes';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { useTranslation } from 'react-i18next';

interface Props {
  validators: OrderFormValidators;
  formError: OrderFormError | undefined;
  orderType: PlaceOrderType;
  showTpSlCheckbox: boolean;
  isTpSlCheckboxChecked: boolean;
  setIsTpSlCheckboxChecked: (isChecked: boolean) => void;
  isTpSlCheckboxDisabled: boolean;
  currentMarket: StaticMarketData | undefined;
  tpSlOrderForm: UseTpSlOrderForm | undefined;
}

export function OrderSettings({
  validators,
  formError,
  orderType,
  showTpSlCheckbox,
  isTpSlCheckboxChecked,
  setIsTpSlCheckboxChecked,
  isTpSlCheckboxDisabled,
  currentMarket,
  tpSlOrderForm,
}: Props) {
  const { t } = useTranslation();

  const timeInForceInDaysErrorTooltipContent =
    useOrderSettingsTimeInForceInDaysErrorTooltipContent({ formError });

  const {
    showTimeInForceSelect,
    timeInForceType,
    setTimeInForceType,
    timeInForceRegister,
    postOnlyChecked,
    onPostOnlyCheckedChange,
    onReduceOnlyCheckedChange,
    reduceOnlyChecked,
    twapRandomOrderChecked,
    onTwapRandomOrderCheckedChange,
    showGoodUntilInput,
    showPostOnlyCheckbox,
    showTwapRandomOrderCheckbox,
  } = useOrderSettings({
    validators,
    orderType,
  });

  return (
    <div className="flex flex-col gap-y-5 text-xs">
      <div className="grid grid-cols-2 gap-x-2.5">
        <div
          className={joinClassNames(
            // Add padding to vertically align the checkbox with the time in force select.
            'pt-1',
            'flex flex-col gap-y-3',
          )}
        >
          {showPostOnlyCheckbox && (
            <Checkbox.Row>
              <Checkbox.Check
                id="post-only-order"
                checked={postOnlyChecked}
                onCheckedChange={onPostOnlyCheckedChange}
                sizeVariant="xs"
                dataTestId="order-settings-post-only-checkbox"
              />
              <CheckboxLabelWithTooltip
                definitionId="tradingPostOnly"
                id="post-only-order"
                sizeVariant="xs"
              >
                {t(($) => $.postOnly)}
              </CheckboxLabelWithTooltip>
            </Checkbox.Row>
          )}
          {showTwapRandomOrderCheckbox && (
            <Checkbox.Row>
              <Checkbox.Check
                id="twap-random-order"
                checked={twapRandomOrderChecked}
                onCheckedChange={onTwapRandomOrderCheckedChange}
                sizeVariant="xs"
                dataTestId="order-settings-twap-random-checkbox"
              />
              <CheckboxLabelWithTooltip
                definitionId="tradingTwapRandomOrder"
                id="twap-random-order"
                sizeVariant="xs"
              >
                {t(($) => $.randomOrder)}
              </CheckboxLabelWithTooltip>
            </Checkbox.Row>
          )}
          <Checkbox.Row>
            <Checkbox.Check
              id="reduce-only-order"
              checked={reduceOnlyChecked}
              onCheckedChange={onReduceOnlyCheckedChange}
              sizeVariant="xs"
              dataTestId="order-settings-reduce-only-checkbox"
            />
            <CheckboxLabelWithTooltip
              definitionId="tradingReduceOnly"
              id="reduce-only-order"
              sizeVariant="xs"
            >
              {t(($) => $.reduceOnly)}
            </CheckboxLabelWithTooltip>
          </Checkbox.Row>
          <TpSlCheckbox
            showTpSlCheckbox={showTpSlCheckbox}
            isTpSlCheckboxChecked={isTpSlCheckboxChecked}
            setIsTpSlCheckboxChecked={setIsTpSlCheckboxChecked}
            isTpSlCheckboxDisabled={isTpSlCheckboxDisabled}
          />
        </div>
        <div className="flex flex-col items-end gap-y-1">
          {showTimeInForceSelect && (
            <div className="flex items-center gap-x-2">
              <DefinitionTooltip definitionId="tradingTimeInForce">
                {t(($) => $.timeInForceAbbrev)}
              </DefinitionTooltip>
              <TimeInForceTypeSelect
                timeInForceType={timeInForceType}
                setTimeInForceType={setTimeInForceType}
              />
            </div>
          )}
          {showGoodUntilInput && (
            <NumberInputWithLabel
              {...timeInForceRegister}
              inputContainerClassName="h-7"
              placeholder="0"
              min={1}
              max={365}
              id={timeInForceRegister.name}
              label={t(($) => $.time)}
              endElement={t(($) => $.durations.days)}
              errorTooltipContent={timeInForceInDaysErrorTooltipContent}
            />
          )}
        </div>
      </div>
      <TpSlSection
        currentMarket={currentMarket}
        tpSlOrderForm={tpSlOrderForm}
        isTpSlCheckboxChecked={isTpSlCheckboxChecked}
      />
    </div>
  );
}
