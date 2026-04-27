import { joinClassNames } from '@nadohq/web-common';
import { Button } from '@nadohq/web-ui';
import orderbookAsksIcon from 'client/modules/trading/marketOrders/orderbook/assets/orderbook-asks-icon.svg';
import orderbookBidsAndAsksIcon from 'client/modules/trading/marketOrders/orderbook/assets/orderbook-bids-and-asks-icon.svg';
import orderbookBidsIcon from 'client/modules/trading/marketOrders/orderbook/assets/orderbook-bids-icon.svg';
import { OrderbookViewType } from 'client/modules/trading/marketOrders/orderbook/types';
import Image from 'next/image';

interface Props {
  variant: OrderbookViewType;
  viewType: OrderbookViewType;
  setViewType: (value: OrderbookViewType) => void;
}

export function ToggleViewButton({ variant, viewType, setViewType }: Props) {
  const iconSrcByViewType = (() => {
    switch (variant) {
      case 'bids_and_asks':
        return orderbookBidsAndAsksIcon;
      case 'only_asks':
        return orderbookAsksIcon;
      case 'only_bids':
        return orderbookBidsIcon;
    }
  })();

  return (
    <Button
      className={joinClassNames(
        'bg-surface-1 size-6 rounded-sm',
        viewType === variant ? 'opacity-100' : 'opacity-30 hover:opacity-70',
      )}
      onClick={() => setViewType(variant)}
    >
      <Image src={iconSrcByViewType} className="h-auto w-6" alt="" />
    </Button>
  );
}
