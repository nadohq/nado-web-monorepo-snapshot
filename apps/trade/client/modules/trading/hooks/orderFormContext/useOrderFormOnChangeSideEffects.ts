import { fractionValidator, safeParseForData } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import {
  LAST_SELECTED_ENGINE_ORDER_TYPES,
  LastSelectedEngineOrderType,
} from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import {
  OrderFormValues,
  RoundAmountFn,
  RoundPriceFn,
} from 'client/modules/trading/types/orderFormTypes';
import {
  convertAssetAmountToOrderSize,
  convertOrderSizeToAssetAmount,
  toNewDenomOrderSize,
} from 'client/modules/trading/utils/orderSizeConversions';
import { toSafeFormFraction } from 'client/utils/form/toSafeFormFraction';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { PrimitiveAtom, useAtom } from 'jotai';
import { useEffect } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface Params {
  form: UseFormReturn<OrderFormValues>;
  productId: number | undefined;
  priceInputAtom: PrimitiveAtom<BigNumber | undefined>;
  maxAssetOrderSize: BigNumber | undefined;
  inputConversionPrice: BigNumber | undefined;
  roundPrice: RoundPriceFn;
  roundAssetAmount: RoundAmountFn;
  handleValueClick: (value: string) => void;
}

/**
 * Side effects for syncing inputs. Makes the following assumptions:
 * - There is no validation for % amount
 * - The form is in the `onTouched` mode, so we must "touch" the fields that we set in order for subsequent validation to occur on change
 */
export function useOrderFormOnChangeSideEffects({
  form,
  productId,
  priceInputAtom,
  maxAssetOrderSize,
  inputConversionPrice,
  roundPrice,
  roundAssetAmount,
  handleValueClick,
}: Params) {
  const { setSavedUserState } = useSavedUserState();

  // Update price input on atom value change (from clicking on chart / OB etc)
  const [priceInputAtomValue, setPriceInputAtomValue] = useAtom(priceInputAtom);
  useEffect(
    () => {
      if (priceInputAtomValue != null) {
        handleValueClick(roundPrice(priceInputAtomValue).toString());
        setPriceInputAtomValue(undefined);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [priceInputAtomValue],
  );

  const [
    sizeInput,
    sizeDenom,
    fractionInput,
    sizeSource,
    timeInForceType,
    orderType,
    side,
  ] = useWatch({
    control: form.control,
    name: [
      'size',
      'sizeDenom',
      'amountFraction',
      'sizeSource',
      'orderSettings.timeInForceType',
      'orderType',
      'side',
    ],
  });

  // Update based on max order size change
  useEffect(
    () => {
      // Fire only when we have the necessary data
      if (!inputConversionPrice || !maxAssetOrderSize) {
        return;
      }

      // Size as source of truth
      const validSize = parseValidNumber(sizeInput);

      const validAssetAmount = convertOrderSizeToAssetAmount({
        size: validSize,
        sizeDenom,
        conversionPrice: inputConversionPrice,
        roundAssetAmount,
      });

      if (sizeSource === 'size' && validAssetAmount) {
        // We want to set the size input to run validation
        form.setValue('size', sizeInput, {
          shouldValidate: true,
          shouldTouch: true,
        });

        form.setValue(
          'amountFraction',
          toSafeAmountFraction(maxAssetOrderSize, validAssetAmount.toString()),
        );
      }

      // Fraction as source of truth
      const validAmountFraction = safeParseForData(
        fractionValidator,
        fractionInput,
      );
      if (sizeSource === 'fraction' && validAmountFraction) {
        const assetAmount = maxAssetOrderSize.multipliedBy(validAmountFraction);

        // Convert asset amount to size based on sizeDenom
        const size = convertAssetAmountToOrderSize({
          assetAmount,
          sizeDenom,
          conversionPrice: inputConversionPrice,
          roundAssetAmount,
        });

        form.setValue('size', size.toString(), {
          shouldValidate: true,
          shouldTouch: true,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [maxAssetOrderSize],
  );

  // Reset the form on product ID change
  // This needs to be placed AFTER the max order size change above. Hooks run sequentially, so if placed before,
  // the max order size change (caused by product ID change further up the change) will fire after the form reset,
  // essentially nullifying the reset as it still has the "stale" form values.
  useEffect(
    () => {
      // We want to keep the direction, order type, and order unit selection
      const { orderType, sizeDenom, side } = form.getValues();
      form.reset();
      form.setValue('orderType', orderType);
      form.setValue('sizeDenom', sizeDenom);
      form.setValue('side', side);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productId],
  );

  // Size change listener
  useEffect(
    () => {
      if (sizeSource !== 'size') {
        return;
      }

      // Size as source of truth
      const validSize = parseValidNumber(sizeInput);

      const validAssetAmount = convertOrderSizeToAssetAmount({
        size: validSize,
        sizeDenom,
        conversionPrice: inputConversionPrice,
        roundAssetAmount,
      });

      if (validAssetAmount) {
        form.setValue(
          'amountFraction',
          toSafeAmountFraction(maxAssetOrderSize, validAssetAmount.toString()),
        );
      } else {
        form.setValue('amountFraction', 0);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sizeInput],
  );

  // Fraction amount change listener
  useEffect(
    () => {
      if (sizeSource !== 'fraction') {
        return;
      }

      if (maxAssetOrderSize && inputConversionPrice && fractionInput) {
        const assetAmount = maxAssetOrderSize.multipliedBy(fractionInput);

        // Convert asset amount to size based on sizeDenom
        const size = convertAssetAmountToOrderSize({
          assetAmount,
          sizeDenom,
          conversionPrice: inputConversionPrice,
          roundAssetAmount,
        });

        form.setValue('size', size.toString(), {
          shouldValidate: true,
          shouldTouch: true,
        });
      } else {
        form.resetField('size');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fractionInput],
  );

  // Size denom change listener
  // Handle cases where the size denom is changed by modifying the size input
  // Convert the size input to the new denom
  useEffect(() => {
    const size = parseValidNumber(sizeInput);

    if (!size) {
      return;
    }

    if (inputConversionPrice) {
      const newSize = toNewDenomOrderSize({
        size,
        sizeDenom,
        conversionPrice: inputConversionPrice,
        roundAssetAmount,
      });

      if (newSize) {
        form.setValue('size', newSize.toString(), {
          shouldValidate: true,
          shouldTouch: true,
        });
      }
    } else {
      form.resetField('size');
      form.setValue('amountFraction', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeDenom]);

  // Reset order settings on timeInForceType or orderType change
  // Note that we do NOT reset reduce-only (always available)
  // or isTpSlEnabled (managed by the isTpSlCheckboxDisabled effect in usePerpOrderFormOnChangeSideEffects)
  useEffect(() => {
    form.setValue('orderSettings.timeInForceInDays', '');
    form.setValue('orderSettings.postOnly', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeInForceType, orderType]);

  // Save orderType and sizeDenom selections to user settings
  useEffect(() => {
    // Only save if orderType is 'market' or 'limit'
    const isEngineOrderType = LAST_SELECTED_ENGINE_ORDER_TYPES.includes(
      orderType as LastSelectedEngineOrderType,
    );

    if (!isEngineOrderType) {
      return;
    }

    setSavedUserState((prev) => {
      prev.trading.lastSelectedEngineOrderType =
        orderType as LastSelectedEngineOrderType;
      return prev;
    });
  }, [orderType, setSavedUserState]);

  useEffect(() => {
    setSavedUserState((prev) => {
      prev.trading.lastSelectedSizeDenom = sizeDenom;
      return prev;
    });
  }, [sizeDenom, setSavedUserState]);

  useEffect(() => {
    setSavedUserState((prev) => {
      prev.trading.lastSelectedSide = side;
      return prev;
    });
  }, [side, setSavedUserState]);
}

function toSafeAmountFraction(
  maxOrderSize: BigNumber | undefined,
  assetAmountInput: string,
) {
  const assetAmount = parseValidNumber(assetAmountInput);
  return toSafeFormFraction(assetAmount, maxOrderSize);
}

function parseValidNumber(value: string): BigNumber | undefined {
  return safeParseForData(positiveBigNumberValidator, value);
}
