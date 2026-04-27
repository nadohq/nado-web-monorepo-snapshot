/**
 * Script to fund multiple wallets with ETH, mint mock tokens, and deposit to Nado
 *
 * Usage:
 * 1. Set PRIVATE_KEY in .env (the funder)
 * 2. Add recipient private keys to RECIPIENT_PRIVATE_KEYS
 * 3. Run with: bun run src/scripts/fundWallets.ts
 */

import { addDecimals } from '@nadohq/client';
import dotenv from 'dotenv';
import {
  createTestNadoClient,
  createTestPublicClient,
  createTestWalletClient,
} from 'src/utils/clients';
import { Hex, parseEther } from 'viem';
import { Address, privateKeyToAccount } from 'viem/accounts';

dotenv.config({
  path: '../../.env',
});

const account = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);

// Initialize clients
// walletClient: For signing transactions (funder wallet)
// publicClient: For reading chain state
// nadoClient: Nado SDK instance for the funder
const walletClient = createTestWalletClient(account);
const publicClient = createTestPublicClient();
const nadoClient = createTestNadoClient(walletClient, publicClient);

/** Amount of tokens to mint/deposit (in wei) */
const depositAmount = addDecimals(10000000, 6);

/** List of recipient private keys to fund */
const RECIPIENT_PRIVATE_KEYS: Address[] = ['0x'];

/**
 * Helper to transfer native ETH to a recipient
 *
 * @param to - Recipient address
 * @param amount - Amount in ETH (string, e.g. "0.01")
 */
async function transferEth(to: string, amount: string) {
  console.log(`Transferring ${amount} ETH to ${to}...`);
  const hash = await walletClient.sendTransaction({
    to: to as Address,
    value: parseEther(amount),
  });
  await publicClient.waitForTransactionReceipt({ hash });
  console.log(`ETH transferred: ${hash}`);
}

/**
 * Main function to fund wallets
 * 1. Mints mock tokens for the funder wallet
 * 2. Iterates over recipient keys to:
 *    a) Seed with ETH from funder
 *    b) Mint mock tokens for recipient
 *    c) Deposit tokens to Nado for recipient
 */
async function main() {
  // Mint for the funding wallet (optional, ensures connectivity)
  const mintTxHash = await nadoClient.spot._mintMockERC20({
    amount: depositAmount,
    productId: 0,
  });
  await publicClient.waitForTransactionReceipt({ hash: mintTxHash });
  console.log(`Funder Minted: ${mintTxHash}`);

  // Loop through recipients
  for (const pk of RECIPIENT_PRIVATE_KEYS) {
    const account = privateKeyToAccount(pk);
    const recipientAddress = account.address;
    console.log(`Processing recipient: ${recipientAddress}`);

    // a) Seed account with ETH
    // We use the main walletClient (funder) to send ETH
    await transferEth(recipientAddress, '0.0001');

    // Setup client for recipient
    const recipientWalletClient = createTestWalletClient(account);
    const recipientNadoClient = createTestNadoClient(
      recipientWalletClient,
      publicClient,
    );

    // b) Minting tokens on nadoClient (for recipient)
    console.log(`Minting tokens for ${recipientAddress}...`);
    const recipientMintHash = await recipientNadoClient.spot._mintMockERC20({
      amount: depositAmount,
      productId: 0,
    });
    await publicClient.waitForTransactionReceipt({ hash: recipientMintHash });
    console.log(`Recipient Minted: ${recipientMintHash}`);

    // c) Depositing to nado
    // First approve allowance
    console.log(`Approving allowance for ${recipientAddress}...`);
    const approveHash = await recipientNadoClient.spot.approveAllowance({
      productId: 0,
      amount: depositAmount,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    console.log(`Approved: ${approveHash}`);

    // Then deposit
    console.log(`Depositing for ${recipientAddress}...`);
    const depositHash = await recipientNadoClient.spot.deposit({
      subaccountName: 'default',
      productId: 0,
      amount: depositAmount,
    });
    await publicClient.waitForTransactionReceipt({ hash: depositHash });
    console.log(`Deposited: ${depositHash}`);
    console.log(`==============================================`);
    console.log(`==============================================`);
  }
}

main();
