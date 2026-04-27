import { FundingRatePeriod } from 'client/modules/localstorage/userState/types/userFundingRatePeriodTypes';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';

export function useFundingRatePeriod() {
  const { savedUserState, setSavedUserState } = useSavedUserState();
  const fundingRatePeriod = savedUserState.fundingRatePeriod;

  const setFundingRatePeriod = useCallback(
    (fundingRatePeriod: FundingRatePeriod) => {
      setSavedUserState((prev) => ({
        ...prev,
        fundingRatePeriod,
      }));
    },
    [setSavedUserState],
  );

  return {
    fundingRatePeriod,
    setFundingRatePeriod,
  };
}
