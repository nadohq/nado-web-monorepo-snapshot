import { toBigNumber } from '@nadohq/client';
import { priceInputAtom } from 'client/store/trading/commonTradingStore';
import { useSetAtom } from 'jotai';
import { debounce } from 'lodash';
import {
  CrossHairMovedEventParams,
  IChartingLibraryWidget,
} from 'public/charting_library';
import { useEffect, useRef } from 'react';

interface Params {
  tvWidget: IChartingLibraryWidget | undefined;
}

export function useUpdatePriceOnCrosshairClick({ tvWidget }: Params) {
  const priceRef = useRef<number>(null);
  const setPriceInput = useSetAtom(priceInputAtom);

  useEffect(() => {
    if (!tvWidget) {
      return;
    }

    const crossHairMovedSubscription = tvWidget.activeChart().crossHairMoved();

    const onMouseUp = () => {
      if (!priceRef.current) {
        return;
      }
      if (tvWidget.activeChart().selection().allSources().length) {
        return; // Don't set price if user is manipulating a shape (e.g. orderline)
      }

      setPriceInput(toBigNumber(priceRef.current));
    };

    // Debounce the crosshair moved event to prevent updating priceRef too frequently
    // Doesn't necessarily offer CPU improvements, but prevents unnecessary updates to priceRef
    const onCrosshairMoved = debounce((params: CrossHairMovedEventParams) => {
      priceRef.current = params.price;
    }, 100);

    crossHairMovedSubscription.subscribe(null, onCrosshairMoved);

    // In the absense of click event, we're using mouse_up so that selection
    // is finalized first (e.g. shape selection).
    // Lifecycle of mouse event: 1. mouse_down 2. selection 3. mouse_up 4. click
    tvWidget.subscribe('mouse_up', onMouseUp);

    return () => {
      try {
        crossHairMovedSubscription.unsubscribe(null, onCrosshairMoved);
        tvWidget.unsubscribe('mouse_up', onMouseUp);
      } catch (err) {
        console.debug(
          '[useUpdatePriceOnCrosshairClick] Failed to unsubscribe',
          err,
        );
      }
    };
  }, [setPriceInput, tvWidget]);
}
