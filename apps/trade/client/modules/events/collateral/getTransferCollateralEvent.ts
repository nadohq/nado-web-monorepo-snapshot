import { NadoTransferQuoteTx, subaccountFromHex } from '@nadohq/client';
import { isIsoSubaccountHex, SubaccountProfile } from '@nadohq/react-client';
import { AllMarketsStaticDataForChainEnv } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { assertEventType } from 'client/modules/events/collateral/assertEventType';
import {
  getBaseCollateralEvent,
  GetBaseCollateralEventParams,
} from 'client/modules/events/collateral/getBaseCollateralEvent';
import { TransferCollateralEvent } from 'client/modules/events/collateral/types';
import { createRowId } from 'client/utils/createRowId';
import type { TFunction } from 'i18next';
import { toBytes } from 'viem';

export interface GetTransferCollateralEventParams extends GetBaseCollateralEventParams {
  getSubaccountProfile: (subaccountName: string) => SubaccountProfile;
  t: TFunction;
}

export function getTransferCollateralEvent({
  event,
  allMarketsStaticData,
  getSubaccountProfile,
  t,
}: GetTransferCollateralEventParams): TransferCollateralEvent {
  assertEventType(event, 'transfer_quote');

  const {
    transfer_quote: { sender, recipient },
  } = event.tx as NadoTransferQuoteTx;

  const fromSubaccount = getNormalizedSubaccountInfo({
    subaccount: sender,
    allMarketsStaticData,
    getSubaccountProfile,
    t,
  });
  const toSubaccount = getNormalizedSubaccountInfo({
    subaccount: recipient,
    allMarketsStaticData,
    getSubaccountProfile,
    t,
  });

  const baseEvent = getBaseCollateralEvent({
    event,
    allMarketsStaticData,
  });

  return {
    ...baseEvent,
    eventType: 'transfer_quote',
    fromSubaccount,
    toSubaccount,
    rowId: createRowId(
      baseEvent.submissionIndex,
      baseEvent.productId,
      fromSubaccount.name,
      toSubaccount.name,
    ),
  };
}

interface GetNormalizedSubaccountInfoParams {
  subaccount: string;
  allMarketsStaticData: AllMarketsStaticDataForChainEnv | undefined;
  getSubaccountProfile: (subaccountName: string) => SubaccountProfile;
  t: TFunction;
}

function getNormalizedSubaccountInfo({
  subaccount,
  allMarketsStaticData,
  getSubaccountProfile,
  t,
}: GetNormalizedSubaccountInfoParams) {
  const subaccountName = subaccountFromHex(subaccount).subaccountName;

  if (isIsoSubaccountHex(subaccount)) {
    const productId = getIsoSubaccountProductId(subaccount);
    const marketName =
      allMarketsStaticData?.perpMarkets[productId]?.metadata.marketName;

    return {
      name: subaccountName,
      username: marketName
        ? t(($) => $.marketNameIso, { marketName })
        : t(($) => $.isolated),
    };
  }

  return {
    name: subaccountName,
    username: getSubaccountProfile(subaccountName).username,
  };
}

/**
 * Subaccounts are in hex and include the isolated product id
 *
 * | address | reserved | productId | id | 'iso' |
 *
 * | 20 bytes | 6 bytes | 2 bytes | 1 byte | 3 bytes |
 *
 * @param subaccount
 * @returns `productId` of the isolated subaccount market
 */
function getIsoSubaccountProductId(subaccount: string) {
  return parseInt(toBytes(subaccount).slice(27, 29).toString());
}
