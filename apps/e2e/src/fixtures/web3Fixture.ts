import { NadoClient } from '@nadohq/client';
import { test as base, BrowserContext, Page } from '@playwright/test';
import * as fs from 'fs';
import {
  Hex,
  isHex,
  PublicClient,
  toHex,
  type Account,
  type Chain,
  type Transport,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { STORAGE_STATE_PATH } from 'src/fixtures/consts';
import {
  createTestNadoClient,
  createTestPublicClient,
  createTestWalletClient,
} from 'src/utils/clients';

/**
 * Injects a mock Web3 provider (window.ethereum) into the page.
 *
 * This replaces MetaMask/browser extension by exposing wallet operations
 * via Playwright's page.exposeFunction. The dApp interacts with window.ethereum
 * as usual, but requests are handled by our test wallet (viem).
 *
 * The mock implements:
 * - Wallet operations (signing, sending transactions) via Node.js bridge
 * - Event emitter (on/removeListener/emit) for wagmi state tracking
 * - RPC forwarding for unhandled methods via the public client
 * - Wallet-specific method stubs (permissions, chain switching)
 */
async function setupWeb3Provider(
  page: Page,
  account: Account,
  walletClient: WalletClient,
  publicClient: PublicClient,
) {
  // Bridge between browser context and Node.js - handles JSON-RPC requests.
  //
  // Why exposeFunction instead of addInitScript?
  // addInitScript serializes the callback and executes it in the browser context.
  // This means closures won't work, and Node.js variables (like walletClient,
  // account, or viem functions) will be undefined.
  //
  // Since cryptographic signing requires the private key, which lives in Node.js,
  // we use exposeFunction to create an IPC bridge. This allows us to execute
  // crypto operations in Node.js and return the results to the browser.
  await page.exposeFunction(
    '__web3_request',
    async (request: { method: string; params?: any[] }) => {
      const { method, params } = request;

      switch (method) {
        // Return test wallet address for account queries
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return [account.address];

        // Return chain ID from walletClient configuration
        case 'eth_chainId':
          return toHex(walletClient.chain?.id ?? 0);

        // Sign plain text messages (e.g., for SIWE authentication)
        case 'personal_sign': {
          const [message] = params as [string, Hex];
          return await walletClient.signMessage({
            message: isHex(message) ? { raw: message } : message,
            account,
          });
        }

        // Sign EIP-712 typed data (e.g., for permit signatures, order signing)
        case 'eth_signTypedData_v4': {
          const [, typedDataStr] = params as [Hex, string];
          const typedData = JSON.parse(typedDataStr);
          return await walletClient.signTypedData({
            ...typedData,
            account,
          });
        }

        // Send on-chain transactions (e.g., deposits, withdrawals, approvals)
        case 'eth_sendTransaction': {
          const [tx] = params as [Record<string, unknown>];
          return await walletClient.sendTransaction({
            ...tx,
            account,
            chain: walletClient.chain,
          });
        }

        // Wallet-specific methods — not forwarded to the RPC node
        case 'wallet_switchEthereumChain':
        case 'wallet_addEthereumChain':
          return null;

        case 'wallet_getPermissions':
        case 'wallet_requestPermissions':
          return [{ parentCapability: 'eth_accounts' }];

        // Forward all other methods (eth_call, eth_blockNumber, net_version, etc.)
        // to the public RPC node so wagmi/viem initialization doesn't break.
        default:
          return await publicClient.request({
            method: method as any,
            params: (params ?? []) as any,
          });
      }
    },
  );

  // Inject EIP-1193 provider into browser's window.ethereum before page loads.
  // Includes a proper event emitter so wagmi can subscribe to accountsChanged,
  // chainChanged, connect, and disconnect events.
  await page.addInitScript(() => {
    type EventCallback = (...args: unknown[]) => void;

    const listeners: Record<string, EventCallback[]> = {};

    const provider = {
      isMetaMask: true,

      request: async (request: { method: string; params?: unknown[] }) => {
        return await (window as any).__web3_request(request);
      },

      on: (event: string, callback: EventCallback) => {
        if (!listeners[event]) {
          listeners[event] = [];
        }
        listeners[event].push(callback);
        return provider;
      },

      removeListener: (event: string, callback: EventCallback) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter((cb) => cb !== callback);
        }
        return provider;
      },

      emit: (event: string, ...args: unknown[]) => {
        listeners[event]?.forEach((cb) => cb(...args));
      },

      removeAllListeners: (event?: string) => {
        if (event) {
          delete listeners[event];
        } else {
          Object.keys(listeners).forEach((key) => delete listeners[key]);
        }
      },
    };

    (window as any).ethereum = provider;
  });
}

/** Test options that can be configured per-test via test.use() */
interface Web3Options {
  /** When true, starts with a fresh browser session instead of loading saved auth state */
  useFreshSession: boolean;
}

/** Fixtures provided to each test */
interface Web3Fixture {
  walletClient: WalletClient<Transport, Chain, Account>;
  publicClient: PublicClient<Transport, Chain>;
  nadoClient: NadoClient;
  account: Account;
  walletAddress: string;
  context: BrowserContext;
  page: Page;
}

/**
 * Extended Playwright test with Web3 wallet fixtures.
 *
 * Provides a complete test wallet setup:
 * - account: Derived from PRIVATE_KEY env var
 * - walletClient: viem client for signing operations
 * - publicClient: viem client for reading chain state
 * - nadoClient: Nado SDK client for programmatic interactions
 * - page: Browser page with injected mock ethereum provider
 *
 * @example
 * ```ts
 * import { test } from 'src/fixtures/web3Fixture';
 *
 * test('can sign message', async ({ page, walletAddress }) => {
 *   // page already has window.ethereum injected
 *   // walletAddress is the test wallet address
 * });
 * ```
 */
export const test = base.extend<Web3Fixture & Web3Options>({
  // Option: start fresh without loading saved auth (default: false = restore session)
  useFreshSession: [false, { option: true }],

  // Derive account from private key environment variable
  account: async ({}, use) => {
    if (!process.env.PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is required.');
    }

    const pk = process.env.PRIVATE_KEY as Hex;
    const account = privateKeyToAccount(pk);
    await use(account);
  },

  // Create viem public client for reading chain state
  publicClient: async ({}, use) => {
    const client = createTestPublicClient();
    await use(client);
  },

  // Create viem wallet client for signing operations
  walletClient: async ({ account }, use) => {
    const client = createTestWalletClient(account);
    await use(client);
  },

  // Create Nado SDK client
  nadoClient: async ({ walletClient, publicClient }, use) => {
    const client = createTestNadoClient(walletClient, publicClient);
    await use(client);
  },

  // Convenience fixture for accessing wallet address directly
  walletAddress: async ({ account }, use) => {
    await use(account.address);
  },

  // Browser context with optional auth state restoration
  context: async ({ browser, useFreshSession }, use) => {
    const hasStorageState = fs.existsSync(STORAGE_STATE_PATH);
    const shouldLoadState = !useFreshSession && hasStorageState;

    const context = await browser.newContext(
      shouldLoadState ? { storageState: STORAGE_STATE_PATH } : {},
    );

    await use(context);
    await context.close();
  },

  // Page with injected mock Web3 provider
  page: async ({ context, account, walletClient, publicClient }, use) => {
    const page = await context.newPage();
    await setupWeb3Provider(page, account, walletClient, publicClient);
    await use(page);
  },
});

export { expect } from '@playwright/test';
