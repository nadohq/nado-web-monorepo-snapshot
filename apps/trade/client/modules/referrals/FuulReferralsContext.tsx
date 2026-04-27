import { Fuul } from '@fuul/sdk';
import {
  PRIMARY_QUOTE_SYMBOLS,
  PrimaryChain,
  Token,
  USDC_INK,
  useRequiredContext,
} from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import { SENSITIVE_DATA } from 'common/environment/sensitiveData';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from 'react';
import { ink } from 'viem/chains';

interface FuulReferralsContextData {
  /**
   * Referral code in the URL query param on initial launch of the app
   */
  referralCodeForSession: string | undefined;
  setReferralCodeForSession: Dispatch<SetStateAction<string | undefined>>;
  apiKey: string;
  /**
   * The token that rewards are paid in (USDT)
   */
  payoutToken: Token;
  /**
   * Volumes are tracked in this currency
   */
  volumeAmountSymbol: string;
  /**
   * The chain that rewards are claimed on
   */
  rewardsChain: PrimaryChain;
}

const FuulReferralsContext = createContext<FuulReferralsContextData | null>(
  null,
);

Fuul.init({ apiKey: SENSITIVE_DATA.fuulApiKey });

export function FuulReferralsProvider({ children }: WithChildren) {
  const [referralCodeForSession, setReferralCodeForSession] = useState<
    string | undefined
  >(undefined);

  const value = useMemo(
    (): FuulReferralsContextData =>
      ({
        referralCodeForSession,
        setReferralCodeForSession,
        apiKey: SENSITIVE_DATA.fuulApiKey,
        payoutToken: USDC_INK,
        volumeAmountSymbol: PRIMARY_QUOTE_SYMBOLS.usdt0,
        rewardsChain: ink,
      }) as const,
    [referralCodeForSession, setReferralCodeForSession],
  );

  return <FuulReferralsContext value={value}>{children}</FuulReferralsContext>;
}

// Hook to consume context
export const useFuulReferralsContext = () =>
  useRequiredContext(FuulReferralsContext);
