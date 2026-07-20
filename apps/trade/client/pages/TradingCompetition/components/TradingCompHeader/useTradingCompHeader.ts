import { nowInSeconds } from '@nadohq/client';
import { useRequiresInitialDeposit } from 'client/hooks/subaccount/useRequiresInitialDeposit';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useAnalyticsContext } from 'client/modules/analytics/AnalyticsContext';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { ALL_TRADING_COMP_CONTEST_IDS } from 'client/modules/tradingCompetition/consts';
import { useExecuteTradingCompRegister } from 'client/modules/tradingCompetition/hooks/execute/useExecuteTradingCompRegister';
import { useQueryTradingCompContests } from 'client/modules/tradingCompetition/hooks/query/useQueryTradingCompContests';
import { useTradingCompEnrollment } from 'client/pages/TradingCompetition/hooks/useTradingCompEnrollment';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { secondsToMilliseconds } from 'date-fns';
import { first } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useTradingCompHeader() {
  const { t } = useTranslation();
  const { data: contestsData } = useQueryTradingCompContests();
  const { isEnrolled } = useTradingCompEnrollment();
  const { mutateAsync: registerAsync, isPending: isEnrollLoading } =
    useExecuteTradingCompRegister();
  const { sendGTMEvent } = useAnalyticsContext();
  const { dispatchNotification } = useNotificationManagerContext();
  const isConnected = useIsConnected();
  const requiresInitialDeposit = useRequiresInitialDeposit();

  const currentContest = first(contestsData?.contests);

  const handleEnroll = useCallback(() => {
    const serverExecutionResult = registerAsync({
      contestIds: ALL_TRADING_COMP_CONTEST_IDS,
    });

    sendGTMEvent({
      event: 'competition_enroll_clicked',
      contestIds: ALL_TRADING_COMP_CONTEST_IDS,
    });

    dispatchNotification({
      type: 'trading_competition_enroll',
      data: { serverExecutionResult },
    });
  }, [registerAsync, dispatchNotification, sendGTMEvent]);

  const enrollButtonState: BaseActionButtonState = (() => {
    if (isEnrolled) {
      return 'success';
    }
    if (isEnrollLoading) {
      return 'loading';
    }
    // The backend rejects enrollment until the account exists (i.e. an initial
    // deposit was made), so keep the button disabled until then. Connecting is
    // handled by other CTAs on the page.
    if (!isConnected || requiresInitialDeposit) {
      return 'disabled';
    }
    return 'idle';
  })();

  const { phase, countdownLabel, countdownTargetMillis } = useMemo(() => {
    if (!currentContest) {
      return {
        phase: undefined,
        countdownLabel: undefined,
        countdownTargetMillis: undefined,
      };
    }

    const nowSeconds = nowInSeconds();
    const startTimeSeconds = currentContest.startTime.toNumber();
    const endTimeSeconds = currentContest.endTime.toNumber();

    const phase = (() => {
      if (nowSeconds < startTimeSeconds) return 'upcoming';
      if (nowSeconds < endTimeSeconds) return 'active';
      return 'ended';
    })();

    const countdownLabel = (() => {
      switch (phase) {
        case 'upcoming':
          return t(($) => $.tradingCompetition.competitionStartsIn);
        case 'active':
          return t(($) => $.tradingCompetition.competitionEndsIn);
        case 'ended':
          return t(($) => $.tradingCompetition.competitionEnded);
      }
    })();

    const countdownTargetMillis = (() => {
      if (phase === 'upcoming') return secondsToMilliseconds(startTimeSeconds);
      if (phase === 'active') return secondsToMilliseconds(endTimeSeconds);
      return undefined;
    })();

    return { phase, countdownLabel, countdownTargetMillis };
  }, [currentContest, t]);

  return {
    phase,
    countdownTargetMillis,
    countdownLabel,
    handleEnroll,
    enrollButtonState,
    // Show the button while the competition is upcoming or active; hide it once
    // inactive (ended or not yet loaded).
    showEnrollButton: !!countdownTargetMillis,
  };
}
