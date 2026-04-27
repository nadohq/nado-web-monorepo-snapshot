import {
  Account,
  Address,
  EIP1193Parameters,
  Hex,
  SwitchChainError,
  createWalletClient,
  custom,
  isHex,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import {
  ChainNotConfiguredError,
  Connector,
  CreateConnectorFn,
  createConnector,
  http,
} from 'wagmi';

import { isPrivateKey } from '../../../utils';
import {
  SendTransactionEIP1193Parameters,
  SignTypedDataEIP1193Parameters,
} from './types';

interface AppManagedWalletConnectorParams {
  id: string;
}

type StoragePropertyKey =
  | 'isConnected'
  | 'privateKey'
  | 'chainId'
  | 'addressOverride';

/**
 * Properties unique to the wallet connector
 */
interface AppManagedProperties {
  setPrivateKey(privateKey: Hex): Promise<void>;

  /**
   * Set the address override for the wallet, null to clear
   */
  setAddressOverride(address: Address | null): Promise<void>;

  getSigningPrivateKey(): Hex;

  getSigningAccount(): Account;
}

export type AppManagedWalletConnector = Connector & AppManagedProperties;

export const APP_MANAGED_WALLET_CONNECTOR_TYPE = 'appManagedWallet';

export function isAppManagedWalletConnector(
  connector: Connector,
): connector is AppManagedWalletConnector {
  return connector.type === APP_MANAGED_WALLET_CONNECTOR_TYPE;
}

/**
 * Connector that allows for customizing displayed addresses / private key
 */
export function appManagedWalletConnector({
  id,
}: AppManagedWalletConnectorParams) {
  const randomPrivateKey = generatePrivateKey();

  let currentChainId: number;
  let isConnected: boolean;
  let addressOverride: Address | null = null;
  // Default the private key to a randomly generated one
  let privateKey: Hex = randomPrivateKey;

  const getStorageKey = (propertyKey: StoragePropertyKey) => {
    return `${APP_MANAGED_WALLET_CONNECTOR_TYPE}.${id}.${propertyKey}`;
  };

  const getExternalAddress = () => {
    return addressOverride ?? privateKeyToAccount(privateKey).address;
  };

  const createConnectorFn: CreateConnectorFn = (config) => {
    const onDisconnect = async (_error?: Error) => {
      config.emitter.emit('disconnect');
      await config.storage?.setItem(getStorageKey('isConnected'), false);
      await config.storage?.removeItem(getStorageKey('privateKey'));
      await config.storage?.removeItem(getStorageKey('chainId'));
      await config.storage?.removeItem(getStorageKey('addressOverride'));
      isConnected = false;
      privateKey = randomPrivateKey;
    };

    const onAccountsChanged = () => {
      config.emitter.emit('change', {
        accounts: [getExternalAddress()],
      });
    };

    const appManagedProperties: AppManagedProperties = {
      setPrivateKey: async (newPrivateKey: Hex) => {
        if (!isPrivateKey(newPrivateKey)) {
          console.warn(
            '[AppManagedWalletConnector] Invalid private key, not setting override.',
          );
          return;
        }
        privateKey = newPrivateKey;
        await config.storage?.setItem(
          getStorageKey('privateKey'),
          newPrivateKey,
        );
        onAccountsChanged();
      },
      setAddressOverride: async (address: Address | null) => {
        addressOverride = address;

        const storageKey = getStorageKey('addressOverride');
        if (address) {
          await config.storage?.setItem(storageKey, address);
        } else {
          await config.storage?.removeItem(storageKey);
        }

        onAccountsChanged();
      },
      getSigningPrivateKey() {
        return privateKey;
      },
      getSigningAccount: () => {
        return privateKeyToAccount(privateKey);
      },
    };

    return {
      id,
      name: id,
      type: APP_MANAGED_WALLET_CONNECTOR_TYPE,
      /**
       * Called when the connector is first initialized
       */
      async setup() {
        const storedChainId: number | null | undefined =
          await config.storage?.getItem(getStorageKey('chainId'));
        const storedIsConnected: boolean | null | undefined =
          await config.storage?.getItem(getStorageKey('isConnected'));

        currentChainId = storedChainId ?? config.chains[0].id;
        isConnected = storedIsConnected ?? false;

        const storedPrivateKey = await config.storage?.getItem(
          getStorageKey('privateKey'),
        );
        const storedAddressOverride: Address | null | undefined =
          await config.storage?.getItem(getStorageKey('addressOverride'));

        if (isConnected) {
          if (storedPrivateKey && isHex(storedPrivateKey)) {
            privateKey = storedPrivateKey;
          }
          addressOverride = storedAddressOverride ?? null;
        }
      },
      async connect(parameters) {
        const requestedChainId = parameters?.chainId;
        if (requestedChainId && currentChainId !== requestedChainId) {
          await this.switchChain?.({ chainId: requestedChainId });
        }

        await config.storage?.setItem(getStorageKey('isConnected'), true);
        await config.storage?.setItem(getStorageKey('chainId'), currentChainId);
        isConnected = true;

        const baseAccounts = await this.getAccounts();

        // The `connect` method's return type is a generic conditional:
        //   withCapabilities extends true ? { accounts: { address, capabilities }[] } :
        //  { accounts: Address[] }
        //
        // TypeScript cannot narrow a generic conditional type through a runtime `if` branch — even
        // though each branch returns the correct shape, the compiler still sees both as incompatible
        // with the unresolved conditional. `as never` is the standard escape hatch: `never` is
        // assignable to every type, so it satisfies the conditional regardless of which branch is
        // taken. The runtime behaviour is correct, and callers still receive the properly typed
        // conditional return through the outer generic.
        if (parameters?.withCapabilities) {
          return {
            accounts: baseAccounts.map((address) => ({
              address,
              capabilities: {} as Record<string, unknown>,
            })),
            chainId: currentChainId,
          } as never;
        }

        return {
          accounts: baseAccounts,
          chainId: currentChainId,
        } as never;
      },
      async disconnect() {
        this.onDisconnect();
      },
      async getAccounts() {
        return [getExternalAddress()];
      },
      async getChainId() {
        return currentChainId;
      },
      async isAuthorized() {
        return isConnected;
      },
      async switchChain(params) {
        const chain = config.chains.find((x) => x.id === params?.chainId);
        if (!chain) {
          throw new SwitchChainError(new ChainNotConfiguredError());
        }
        this.onChainChanged(chain.id.toString());

        return chain;
      },
      onChainChanged(chainIdStr) {
        const chainId = Number(chainIdStr);

        currentChainId = chainId;
        void config.storage?.setItem(getStorageKey('chainId'), chainId);

        config.emitter.emit('change', { chainId });
      },
      async getProvider(params) {
        const chainIdForClient = params?.chainId ?? currentChainId;
        const chain = config.chains.find((x) => x.id === chainIdForClient);
        if (!chain) {
          throw new ChainNotConfiguredError();
        }

        const walletClient = createWalletClient({
          account: appManagedProperties.getSigningAccount(),
          chain,
          transport: http(),
        });

        return custom({
          request: async (params: EIP1193Parameters) => {
            // Handle known methods that require a wallet client
            if (params.method === 'eth_signTypedData_v4') {
              const [, signatureParamsJson] =
                params.params as SignTypedDataEIP1193Parameters;
              return walletClient.signTypedData(
                JSON.parse(signatureParamsJson) as Parameters<
                  typeof walletClient.signTypedData
                >[0],
              );
            }
            if (params.method === 'eth_sendTransaction') {
              const [txData] =
                params.params as SendTransactionEIP1193Parameters;
              return walletClient.sendTransaction(txData);
            }

            // Other requests can go through the provider associated with the wallet client
            return walletClient.request(
              params as Parameters<typeof walletClient.request>,
            );
          },
        })({ retryCount: 0 });
      },
      onAccountsChanged,
      onDisconnect: () => void onDisconnect(),
      ...appManagedProperties,
    };
  };

  return createConnector(createConnectorFn);
}
