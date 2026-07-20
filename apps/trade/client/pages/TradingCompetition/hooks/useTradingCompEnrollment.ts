import { ALL_TRADING_COMP_CONTEST_IDS } from 'client/modules/tradingCompetition/consts';
import { useQuerySubaccountTradingCompRegistrations } from 'client/modules/tradingCompetition/hooks/query/useQuerySubaccountTradingCompRegistrations';
import { useMemo } from 'react';

export function useTradingCompEnrollment() {
  const { data: registrationsData } =
    useQuerySubaccountTradingCompRegistrations();

  const isEnrolled = useMemo(() => {
    if (!registrationsData?.registrations.length) {
      return false;
    }

    const registeredContestIds = new Set(
      registrationsData.registrations.map((r) => r.contestId),
    );

    return ALL_TRADING_COMP_CONTEST_IDS.every((id) =>
      registeredContestIds.has(id),
    );
  }, [registrationsData]);

  return {
    isEnrolled,
  };
}
