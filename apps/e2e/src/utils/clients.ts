import { CHAIN_ENV_TO_CHAIN, ChainEnv, createNadoClient } from '@nadohq/client';
import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type Chain,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';

export const TEST_CHAIN_ENV: ChainEnv = 'inkTestnet';
export const TEST_CHAIN = CHAIN_ENV_TO_CHAIN[TEST_CHAIN_ENV];

export function createTestPublicClient(): PublicClient<Transport, Chain> {
  return createPublicClient({
    chain: TEST_CHAIN,
    transport: http(),
  }) as PublicClient<Transport, Chain>;
}

export function createTestWalletClient(
  account: Account,
): WalletClient<Transport, Chain, Account> {
  return createWalletClient({
    account,
    chain: TEST_CHAIN,
    transport: http(),
  });
}

export function createTestNadoClient(
  walletClient: WalletClient<Transport, Chain, Account>,
  publicClient: PublicClient<Transport, Chain>,
) {
  return createNadoClient(TEST_CHAIN_ENV, {
    walletClient,
    publicClient,
  });
}
