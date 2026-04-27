import { WalletClientWithAccount } from '@nadohq/client';
import { Account, Chain, createWalletClient, http } from 'viem';

export function getWalletClientForLinkedSignerAccount(
  account: Account,
  chain: Chain,
): WalletClientWithAccount {
  return createWalletClient({
    account,
    transport: http(),
    chain,
  });
}
