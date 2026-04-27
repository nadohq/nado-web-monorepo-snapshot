import { useSelect } from '@nadohq/web-ui';
import { FUNDING_RATE_PERIODS } from 'client/modules/localstorage/userState/types/userFundingRatePeriodTypes';
import { useFundingRatePeriod } from 'client/modules/trading/hooks/useFundingRatePeriod';
import { useMemo } from 'react';

export function useFundingRatePeriodSelect() {
  const { fundingRatePeriod, setFundingRatePeriod } = useFundingRatePeriod();

  const options = useMemo(() => {
    return FUNDING_RATE_PERIODS.map((fundingRatePeriod) => {
      return {
        label: fundingRatePeriod,
        value: fundingRatePeriod,
      };
    });
  }, []);

  const {
    selectedOption,
    selectOptions,
    open,
    onValueChange,
    value,
    onOpenChange,
  } = useSelect({
    selectedValue: fundingRatePeriod,
    onSelectedValueChange: setFundingRatePeriod,
    options,
  });

  return {
    fundingRatePeriod,
    selectedOption,
    selectOptions,
    open,
    value,
    onOpenChange,
    onValueChange,
  };
}
