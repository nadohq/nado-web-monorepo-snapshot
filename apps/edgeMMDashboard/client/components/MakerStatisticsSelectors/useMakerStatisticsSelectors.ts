import { ChainEnv, TimeInSeconds } from '@nadohq/client';
import { useEVMContext } from '@nadohq/react-client';
import { SelectOption } from '@nadohq/web-ui';
import { useAllMarkets } from 'client/hooks/query/useAllMarkets';
import { useLatestEpoch } from 'client/hooks/query/useLatestEpoch';
import { first, last, range, startCase } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

export const INTERVAL_OPTIONS: SelectOption<number>[] = [
  {
    label: 'Past 15 Minutes',
    value: 15 * TimeInSeconds.MINUTE,
  },
  {
    label: 'Past 1 Hour',
    value: TimeInSeconds.HOUR,
  },
  {
    label: 'Past 4 Hours',
    value: 4 * TimeInSeconds.HOUR,
  },
  {
    label: 'Past 1 Day',
    value: TimeInSeconds.DAY,
  },
  {
    label: 'Past 2 Days',
    value: 2 * TimeInSeconds.DAY,
  },
  {
    label: 'Past 1 Week',
    value: 7 * TimeInSeconds.DAY,
  },
  {
    label: 'Past 2 Weeks',
    value: 14 * TimeInSeconds.DAY,
  },
  {
    label: 'Past 1 Month',
    value: 30 * TimeInSeconds.DAY,
  },
];

export interface UseMakerStatisticsSelectors {
  chainEnvOptions: SelectOption<ChainEnv>[];
  setPrimaryChainEnv: (value: ChainEnv) => void;
  primaryChainEnv: ChainEnv;
  productOptions: SelectOption<number>[];
  productId: number | undefined;
  setProductId: (value: number) => void;
  epochOptions: SelectOption<number>[];
  epoch: number | undefined;
  setEpoch: (value: number) => void;
  intervalOptions: SelectOption<number>[];
  interval: number;
  setInterval: (value: number) => void;
}

export function useMakerStatisticsSelectors() {
  const { data: allMarketsData } = useAllMarkets();
  const { data: latestEpochData } = useLatestEpoch();
  const { setPrimaryChainEnv, primaryChainEnv, supportedChainEnvs } =
    useEVMContext();

  const [epoch, setEpoch] = useState<number>();
  const [interval, setInterval] = useState<number>(INTERVAL_OPTIONS[3].value); // Past 1 Day as default interval.
  const [productId, setProductId] = useState<number>();

  const epochOptions = useMemo(() => {
    if (!latestEpochData) {
      return [];
    }

    // Epochs always go from 1 to latest epoch.
    const epochs = range(1, latestEpochData.epoch + 1);

    return epochs.map((epoch) => ({
      value: epoch,
      label: epoch.toString(),
    }));
  }, [latestEpochData]);

  const chainEnvOptions = useMemo(() => {
    return supportedChainEnvs.map((value) => ({
      value,
      label: startCase(value),
    }));
  }, [supportedChainEnvs]);

  const productOptions = useMemo(() => {
    if (!allMarketsData) {
      return [];
    }
    return Object.entries(allMarketsData.allMarkets).map(
      ([productId, market]) => ({
        value: Number(productId),
        label: market.metadata.marketName,
      }),
    );
  }, [allMarketsData]);

  // Reset epoch and product when chain env changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEpoch(undefined);
    setProductId(undefined);
  }, [primaryChainEnv]);

  // Set default epoch when options are available and epoch is not set
  if (!epoch && epochOptions.length > 0) {
    setEpoch(last(epochOptions)?.value);
  }

  // Set default productId when options are available and productId is not set
  if (productId == null && productOptions.length > 0) {
    setProductId(first(productOptions)?.value);
  }

  return {
    epochOptions,
    epoch,
    setEpoch,
    intervalOptions: INTERVAL_OPTIONS,
    interval,
    setInterval,
    productOptions,
    productId,
    setProductId,
    chainEnvOptions,
    setPrimaryChainEnv,
    primaryChainEnv,
  };
}
