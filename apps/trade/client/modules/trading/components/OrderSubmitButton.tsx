import { BalanceSide } from '@nadohq/client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import {
  Button,
  getStateOverlayClassNames,
  PrimaryButton,
  STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME,
} from '@nadohq/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { useButtonUserStateErrorProps } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';
import { getOrderSideLabel } from 'client/modules/trading/utils/getOrderSideLabel';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useTranslation } from 'react-i18next';

interface OrderSubmitButtonProps extends WithClassnames {
  state: BaseActionButtonState;
  side: BalanceSide;
  isPerp: boolean;
  marketSymbol: string | undefined;
}

export function OrderSubmitButton({
  state,
  side,
  className,
  isPerp,
  marketSymbol,
}: OrderSubmitButtonProps) {
  const { t } = useTranslation();
  const userStateErrorButtonProps = useButtonUserStateErrorProps();

  const sharedButtonClassNames = joinClassNames(
    'rounded-sm text-sm',
    className,
  );

  // Return early displaying a Primary button if `userStateError` is present
  if (userStateErrorButtonProps) {
    return (
      <PrimaryButton
        dataTestId="order-placement-submit-button"
        className={sharedButtonClassNames}
        {...userStateErrorButtonProps}
      />
    );
  }

  const sideLabel = getOrderSideLabel({
    t,
    alwaysShowOrderDirection: true,
    isPerp,
    isLong: side === 'long',
  });

  const stateContent = {
    loading: (
      <ButtonStateContent.Loading
        singleSignatureMessage={t(($) => $.buttons.placingOrder)}
      />
    ),
    success: (
      <ButtonStateContent.Success
        message={t(($) => $.buttons.orderSubmitted)}
      />
    ),
    disabled: t(($) => $.orderSideSymbol, {
      orderSide: sideLabel,
      symbol: marketSymbol,
    }),
    idle: t(($) => $.orderSideSymbol, {
      orderSide: sideLabel,
      symbol: marketSymbol,
    }),
  }[state];

  const disabled = state === 'disabled';
  const isLoading = state === 'loading';

  const stateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant: 'sm',
    disabled,
    isLoading,
  });

  const baseStateClassNames = (() => {
    if (isLoading || disabled) {
      return 'bg-surface-3 text-button-primary';
    }

    return side === 'long'
      ? 'bg-positive text-positive-muted'
      : 'bg-negative text-negative-muted';
  })();

  // If there is no `userStateError`, display the normal button
  return (
    <Button
      className={joinClassNames(
        'font-medium',
        baseStateClassNames,
        stateOverlayClassNames,
        sharedButtonClassNames,
        STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME['sm'],
      )}
      type="submit"
      isLoading={isLoading}
      disabled={disabled}
      dataTestId="order-placement-submit-button"
    >
      {stateContent}
    </Button>
  );
}
