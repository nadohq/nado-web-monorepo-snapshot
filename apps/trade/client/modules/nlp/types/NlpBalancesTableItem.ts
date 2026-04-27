import { SharedProductMetadata } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';

export interface NlpBalancesTableItem extends WithDataTableRowId {
  metadata: SharedProductMetadata;
  amount: BigNumber;
  valueUsd: BigNumber;
  estimatedPnlUsd: BigNumber | undefined;
  estimatedPnlFrac: BigNumber | undefined;
}
