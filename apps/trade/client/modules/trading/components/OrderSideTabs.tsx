import { BalanceSide } from '@nadohq/client';
import {
  BaseTestProps,
  mergeClassNames,
  WithClassnames,
} from '@nadohq/web-common';
import {
  Button,
  getStateOverlayClassNames,
  STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME,
} from '@nadohq/web-ui';
import { TabsList, Root as TabsRoot, TabsTrigger } from '@radix-ui/react-tabs';
import { OrderFormValues } from 'client/modules/trading/types/orderFormTypes';
import { getOrderSideLabel } from 'client/modules/trading/utils/getOrderSideLabel';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface OrderSideTabButtonProps extends WithClassnames, BaseTestProps {
  isPerp: boolean;
  side: BalanceSide;
  active: boolean;
}

function OrderSideTabButton({
  className,
  side,
  active,
  isPerp,
  dataTestId,
}: OrderSideTabButtonProps) {
  const { t } = useTranslation();

  const stateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant: 'sm',
    disabled: false,
    active,
  });

  const isLong = side === 'long';

  const sideColorClassNames = (() => {
    if (!active) {
      return 'text-text-tertiary';
    }

    return isLong
      ? 'bg-positive text-surface-card'
      : 'bg-negative text-surface-card';
  })();

  return (
    <TabsTrigger key={side} value={side} asChild>
      <Button
        dataTestId={dataTestId}
        className={mergeClassNames(
          'rounded-sm',
          'text-xs font-medium',
          STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME['xs'],
          stateOverlayClassNames,
          sideColorClassNames,
          className,
        )}
      >
        {getOrderSideLabel({
          t,
          alwaysShowOrderDirection: true,
          isPerp,
          isLong,
        })}
      </Button>
    </TabsTrigger>
  );
}

interface OrderSideTabsProps {
  isPerp: boolean;
}

export function OrderSideTabs({ isPerp }: OrderSideTabsProps) {
  const { setValue, control } = useFormContext<OrderFormValues>();

  const side = useWatch({
    control,
    name: 'side',
  });

  return (
    <TabsRoot
      className="flex gap-x-2"
      value={side}
      onValueChange={(side) => setValue('side', side as BalanceSide)}
      asChild
    >
      <TabsList className="bg-surface-1 flex rounded-md p-0.5">
        <OrderSideTabButton
          dataTestId="order-placement-section-order-side-tab-long"
          className="flex-1"
          side="long"
          active={side === 'long'}
          isPerp={isPerp}
        />
        <OrderSideTabButton
          dataTestId="order-placement-section-order-side-tab-short"
          className="flex-1"
          side="short"
          active={side === 'short'}
          isPerp={isPerp}
        />
      </TabsList>
    </TabsRoot>
  );
}
