import { Fuul, UserIdentifierType } from '@fuul/sdk';
import { asyncResult } from '@nadohq/client';
import { first, get } from 'lodash';
import { NextRequest, NextResponse } from 'next/server';
import {
  GetOrCreateFuulReferralCodeParams,
  GetOrCreateFuulReferralCodeResponse,
} from 'server/fuul/types';

const FUUL_GENERATE_CODE_KEY = process.env.FUUL_GENERATE_CODE_KEY;

/**
 * Gets the user's referral code, generating one if they don't have one.
 * Codes are created without a max_uses cap so they're born unlimited.
 */
export async function POST(request: NextRequest) {
  const body: GetOrCreateFuulReferralCodeParams = await request.json();
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

  const existingUserReferralCode = first(existingCodes?.results);
  if (existingUserReferralCode) {
    const responseData: GetOrCreateFuulReferralCodeResponse = {
      created: false,
    };
    return NextResponse.json(responseData);
  }

  console.log(
    '[FuulGetOrCreateCode] No existing referral code for user, generating one',
  );
  const [generateCodesResponse, generateCodesError] = await asyncResult(
    Fuul.generateReferralCodes({
      user_identifier: address,
      user_identifier_type: UserIdentifierType.EvmAddress,
      quantity: 1,
    }),
  );
  if (!generateCodesResponse || generateCodesError) {
    logExternalApiError('Generate referral code', generateCodesError);
    return NextResponse.json(
      { error: 'Failed to generate referral code for user' },
      { status: 500 },
    );
  }

  const responseData: GetOrCreateFuulReferralCodeResponse = { created: true };
  return NextResponse.json(responseData);
}

function logExternalApiError(label: string, error: unknown) {
  // Both our SDK & Fuul use Axios under the hood, so this should work for both.
  // Both backends return useful error info in response.data
  const errorDetails: unknown | undefined = get(error, 'response.data');
  console.error(`[FuulGetOrCreateCode] ${label} error`, errorDetails ?? error);
}
