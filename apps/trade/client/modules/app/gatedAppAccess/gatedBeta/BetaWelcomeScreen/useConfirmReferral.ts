import { safeParseForData } from '@nadohq/web-common';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useFuulReferralsContext } from 'client/modules/referrals/FuulReferralsContext';
import { useExecuteUseFuulReferralCode } from 'client/modules/referrals/hooks/execute/useExecuteUseFuulReferralCode';
import { useQueryFuulReferralCodeStatus } from 'client/modules/referrals/hooks/query/useQueryFuulReferralCodeStatus';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const referralCodeValidator = z.string().length(7);

export type ConfirmReferralActionButtonState =
  | BaseActionButtonState
  | 'code_taken';

export function useConfirmReferral() {
  const { t } = useTranslation();
  const { referralCodeForSession } = useFuulReferralsContext();
  const { dispatchNotification } = useNotificationManagerContext();
  const [referralCodeInput, setReferralCodeInput] = useState(
    referralCodeForSession ?? '',
  );
  const validReferralCodeInput = safeParseForData(
    referralCodeValidator,
    referralCodeInput,
  );

  const { mutateAsync, isPending, isSuccess } = useExecuteUseFuulReferralCode(
    {},
  );
  const { data: referralCodeStatus } = useQueryFuulReferralCodeStatus(
    validReferralCodeInput,
  );

  const onSubmit = () => {
    if (!validReferralCodeInput) {
      return;
    }

    const serverExecutionResult = mutateAsync({
      referralCode: validReferralCodeInput,
    });

    dispatchNotification({
      type: 'action_error_handler',
      data: {
        executionData: { serverExecutionResult },
        errorNotificationTitle: t(($) => $.errors.confirmReferralFailed),
      },
    });
  };

  const buttonState = useMemo((): ConfirmReferralActionButtonState => {
    if (isSuccess) {
      return 'success';
    }
    if (isPending) {
      return 'loading';
    }
    if (validReferralCodeInput) {
      if (referralCodeStatus && !referralCodeStatus.available) {
        return 'code_taken';
      }
      return 'idle';
    }
    return 'disabled';
  }, [referralCodeStatus, isPending, isSuccess, validReferralCodeInput]);

  return {
    onSubmit,
    referralCodeInput,
    setReferralCodeInput,
    buttonState,
  };
}
