'use client';

import { useSubaccountContext } from '@nadohq/react-client';
import { useMutation } from '@tanstack/react-query';
import { useUpdateQueries } from 'client/hooks/execute/util/useUpdateQueries';
import { addressFuulReferralCodeQueryKey } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralCode';
import { useEffect, useMemo, useRef } from 'react';
import safeStringify from 'safe-stable-stringify';
import {
  UpdateFuulReferralCodeParams,
  UpdateFuulReferralCodeResponse,
} from 'server/fuul/types';

/**
 * Automatically update the user's referral allowance by hitting /fuul-update-code
 * on first load or subaccount change
 */
export function AutoUpdateAddressFuulReferralCode() {
  const { currentSubaccount } = useSubaccountContext();

  const updateQueryKeys = useMemo(() => {
    return [addressFuulReferralCodeQueryKey(currentSubaccount?.address)];
  }, [currentSubaccount?.address]);
  const refetchQueries = useUpdateQueries(updateQueryKeys);

  // Effects can run multiple times in Strict Mode, use a ref to avoid double mutations
  const isRunningMutationRef = useRef(false);

  const { mutate } = useMutation({
    mutationFn: async () => {
      const { address } = currentSubaccount;
      if (!address) {
        throw new Error('No address connected for updating referral code');
      }
      if (isRunningMutationRef.current) {
        throw new Error('Aborting, mutation already in progress');
      }
      isRunningMutationRef.current = true;

      console.debug(
        '[AutoUpdateAddressFuulReferralCode] Updating referral code for user',
      );

      const mutationParams: UpdateFuulReferralCodeParams = {
        address,
      };
      const response = await fetch('/api/fuul-update-code', {
        body: safeStringify(mutationParams),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const responseData: UpdateFuulReferralCodeResponse =
        await response.json();
      return responseData;
    },
    onSuccess: (data) => {
      console.debug(
        '[AutoUpdateAddressFuulReferralCode] Successfully updated user referral code',
        data,
      );
      refetchQueries();
    },
    onSettled: () => {
      isRunningMutationRef.current = false;
    },
  });

  useEffect(
    () => {
      if (!currentSubaccount.address || isRunningMutationRef.current) {
        return;
      }
      // Only run if the tab was opened on the foreground
      if (document.visibilityState !== 'visible') {
        return;
      }
      mutate();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentSubaccount.address],
  );

  return null;
}
