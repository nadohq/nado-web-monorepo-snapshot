import { Fuul, UserIdentifierType } from '@fuul/sdk';
import {
  asyncResult,
  BigNumbers,
  ChainEnv,
  createNadoClient,
  nowInSeconds,
  removeDecimals,
  sumBigNumberBy,
} from '@nadohq/client';
import { getPrimaryChain } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { AMBASSADOR_ADDRESSES_LOWERCASE } from 'client/modules/referrals/consts';
import { clientEnv } from 'common/environment/clientEnv';
import { first, get } from 'lodash';
import { NextRequest, NextResponse } from 'next/server';
import {
  UpdateFuulReferralCodeParams,
  UpdateFuulReferralCodeResponse,
} from 'server/fuul/types';
import { createPublicClient, http, PublicClient } from 'viem';

const FUUL_GENERATE_CODE_KEY = process.env.FUUL_GENERATE_CODE_KEY;

// Currently set to 0 but the code remains in case we want to add it back
const INVITES_FOR_DEPOSIT = 0;
const VOL_PER_INVITE = 250_000; // $250k volume per invite
const MAX_REFERRAL_COUNT = 100;

const PRIMARY_CHAIN_ENV: ChainEnv =
  clientEnv.base.dataEnv === 'nadoMainnet' ? 'inkMainnet' : 'inkTestnet';
const PRIMARY_CHAIN = getPrimaryChain(PRIMARY_CHAIN_ENV);

const INDEXER_CLIENT = createNadoClient(PRIMARY_CHAIN_ENV, {
  publicClient: createPublicClient({
    chain: PRIMARY_CHAIN,
    transport: http(),
  }) as PublicClient,
}).context.indexerClient;

const NO_UPDATE_RESPONSE: UpdateFuulReferralCodeResponse = {
  numReferralsAdded: 0,
};

/**
 * Autoupdates number of eligible referrals for a given address
 * based on criteria.
 *
 * Ambassadors, or "L1", are manually updated by the team
 * L2, L3, etc. follow a standardized criteria for earning referrals, up to MAX_REFERRAL_COUNT
 */
export async function POST(request: NextRequest) {
  const body: UpdateFuulReferralCodeParams = await request.json();
  const address = get(body, 'address');

  if (!FUUL_GENERATE_CODE_KEY) {
    return NextResponse.json(
      { error: 'Required env vars are not set' },
      { status: 500 },
    );
  }

  if (!address) {
    return NextResponse.json(
      { error: 'Address not provided' },
      { status: 400 },
    );
  }

  Fuul.init({
    apiKey: FUUL_GENERATE_CODE_KEY,
  });

  // Query the existing referral codes
  const [existingCodes, existingCodesError] = await asyncResult(
    Fuul.listUserReferralCodes({
      user_identifier: address,
      user_identifier_type: UserIdentifierType.EvmAddress,
    }),
  );
  if (existingCodesError) {
    logExternalApiError('Get existing referral codes', existingCodesError);
    return NextResponse.json(
      { error: 'Failed to fetch existing referral codes for user' },
      { status: 500 },
    );
  }

  // Each user should only have one referral code, if they don't have one, create one
  const existingUserReferralCode = first(existingCodes?.results);
  let userReferralCode = existingUserReferralCode?.code;
  if (!existingUserReferralCode) {
    console.log(
      '[FuulUpdateCode] No existing referral code for user, generating one',
    );
    const [generateCodesResponse, generateCodesError] = await asyncResult(
      Fuul.generateReferralCodes({
        user_identifier: address,
        user_identifier_type: UserIdentifierType.EvmAddress,
        quantity: 1,
        max_uses: 0,
      }),
    );
    if (!generateCodesResponse || generateCodesError) {
      logExternalApiError('Generate referral code', generateCodesError);
      return NextResponse.json(
        { error: 'Failed to generate referral code for user' },
        { status: 500 },
      );
    }
    userReferralCode = generateCodesResponse[0].code;
  }
  if (!userReferralCode) {
    return NextResponse.json(
      { error: 'Failed to get referral code for user after generation' },
      { status: 500 },
    );
  }

  // Check that we can update referral codes for the user. Only L2, L3+ referrals are eligible.
  const [referralStatus, referralStatusError] = await asyncResult(
    Fuul.getReferralStatus({
      user_identifier: address,
      user_identifier_type: UserIdentifierType.EvmAddress,
    }),
  );
  if (!referralStatus) {
    logExternalApiError('Get referral status', referralStatusError);
    return NextResponse.json(
      { error: 'Failed to fetch referral status for user' },
      { status: 500 },
    );
  }
  const referrerForUser = referralStatus.referrer_identifier?.toLowerCase();
  if (!referrerForUser) {
    console.log('[FuulUpdateCode] User has no referrer', referrerForUser);
    return NextResponse.json(NO_UPDATE_RESPONSE);
  }
  if (AMBASSADOR_ADDRESSES_LOWERCASE.has(address.toLowerCase())) {
    console.log('[FuulUpdateCode] User is an ambassador, manual update only');
    return NextResponse.json(NO_UPDATE_RESPONSE);
  }

  // Check that the user is an L2 referral (i.e. has an ambassador as their referrer)
  const isL2Referral = AMBASSADOR_ADDRESSES_LOWERCASE.has(referrerForUser);

  const currentTotalReferrals: number = existingUserReferralCode?.max_uses ?? 0;

  /**
   * Now determine eligibility.
   * - L2 receive 3 referrals by having an account value > $100
   * - L2, L3, etc. receive 1 referral per $1M traded, up to 20 referrals total
   */
  let numEligibleReferrals = 0;

  // Get first 5 subaccounts for the address
  const [subaccountsResponse, subaccountsError] = await asyncResult(
    INDEXER_CLIENT.listSubaccounts({
      address,
    }),
  );
  if (!subaccountsResponse) {
    logExternalApiError('Fetch subaccounts', subaccountsError);
    return NextResponse.json(
      { error: 'Failed to fetch subaccounts for user' },
      { status: 500 },
    );
  }
  const crossSubaccounts = subaccountsResponse
    .filter((subaccount) => !subaccount.isolated)
    .slice(0, 5);

  let hasMetMinDeposit = false;
  let totalVolume = BigNumbers.ZERO;

  // Check eligibility across all subaccounts
  for (const subaccount of crossSubaccounts) {
    const subaccountName = subaccount.subaccountName;

    // Check account deposits only if we haven't met the min deposit yet
    if (!hasMetMinDeposit) {
      const [depositEventsResponse, depositEventsError] = await asyncResult(
        INDEXER_CLIENT.getPaginatedSubaccountCollateralEvents({
          limit: 50,
          subaccountOwner: address,
          subaccountName,
          eventTypes: ['deposit_collateral'],
        }),
      );
      if (!depositEventsResponse) {
        logExternalApiError('Fetch deposit events', depositEventsError);
        return NextResponse.json(
          { error: 'Failed to fetch deposit events for user' },
          { status: 500 },
        );
      }

      // Must deposit > $100
      let totalDepositedValue = BigNumbers.ZERO;
      for (const event of depositEventsResponse.events) {
        const oraclePrice = event.snapshot.market.product.oraclePrice;
        const depositValue = removeDecimals(
          event.amount.multipliedBy(oraclePrice),
        );
        totalDepositedValue = totalDepositedValue.plus(depositValue);

        if (totalDepositedValue.gt(100)) {
          break;
        }
      }
      hasMetMinDeposit = totalDepositedValue.gt(100);
    }

    // Check volume for this subaccount
    const [snapshotsResponse, snapshotsError] = await asyncResult(
      INDEXER_CLIENT.getMultiSubaccountSnapshots({
        subaccounts: [
          {
            subaccountOwner: address,
            subaccountName,
          },
        ],
        timestamps: [nowInSeconds()],
      }),
    );
    if (!snapshotsResponse) {
      logExternalApiError('Fetch subaccount snapshots', snapshotsError);
      return NextResponse.json(
        { error: 'Failed to fetch subaccount snapshots for user' },
        { status: 500 },
      );
    }

    const subaccountHexId = snapshotsResponse.subaccountHexIds[0];
    const snapshotForSubaccount = first(
      Object.values(get(snapshotsResponse.snapshots, subaccountHexId, {})),
    );
    const volumeWithDecimals = sumBigNumberBy(
      snapshotForSubaccount?.balances,
      (balance) => {
        return balance.trackedVars.quoteVolumeCumulative;
      },
    );
    totalVolume = totalVolume.plus(volumeWithDecimals);
  }

  // Calculate referrals from min deposit
  if (hasMetMinDeposit && isL2Referral) {
    numEligibleReferrals += INVITES_FOR_DEPOSIT;
  }

  // Calculate referrals from volume
  const totalVolumeWithoutDecimals = removeDecimals(totalVolume);
  const numReferralsFromVolume = totalVolumeWithoutDecimals
    .div(VOL_PER_INVITE)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
    .toNumber();
  numEligibleReferrals += numReferralsFromVolume;

  // Cap to max
  numEligibleReferrals = BigNumber.min(
    numEligibleReferrals,
    MAX_REFERRAL_COUNT,
  ).toNumber();

  // Now generate the difference
  const numReferralsAdded = numEligibleReferrals - currentTotalReferrals;
  console.log('[FuulUpdateCode] Finished checks', {
    currentTotalUses: currentTotalReferrals,
    numEligibleReferrals,
    numReferralsAdded,
    totalVolume: totalVolumeWithoutDecimals,
    hasMetMinDeposit,
    userReferralCode,
  });

  if (numReferralsAdded <= 0) {
    return NextResponse.json(NO_UPDATE_RESPONSE);
  }

  const [, updateError] = await asyncResult(
    Fuul.updateReferralCode({
      // Referral code should always be defined here
      code: userReferralCode,
      max_uses: numEligibleReferrals,
    }),
  );
  if (updateError) {
    logExternalApiError('Update referral code', updateError);
  }

  const responseData: UpdateFuulReferralCodeResponse = {
    numReferralsAdded,
  };
  return NextResponse.json(responseData);
}

function logExternalApiError(label: string, error: unknown) {
  // Both our SDK & Fuul use Axios under the hood, so this should work for both.
  // Both backends return useful error info in response.data
  const errorDetails: unknown | undefined = get(error, 'response.data');
  console.error(`[FuulUpdateCode] ${label} error`, errorDetails ?? error);
}
