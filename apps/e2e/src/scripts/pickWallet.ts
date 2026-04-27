/**
 * Script to select a wallet for E2E tests based on the GitHub Run ID.
 *
 * It parses a JSON array of private keys from the `TEST_E2E_WALLETS_JSON` environment variable
 * (populated from GitHub Secrets) and selects one using modulo arithmetic on `GITHUB_RUN_ID`.
 * The selected private key is then exported to `GITHUB_ENV` as `PRIVATE_KEY` for use in subsequent steps.
 */
import fs from 'fs';

// GITHUB_RUN_ID: A unique number for each workflow run (e.g., 21747009794).
// Provided automatically by GitHub Actions runner.
const runId = process.env.GITHUB_RUN_ID;

// TEST_E2E_WALLETS_JSON: A JSON string containing an array of private keys.
// Example: '["0xKey1...", "0xKey2...", "0xKey3..."]'
// This must be set in GitHub Repository Secrets.
const walletsJson = process.env.TEST_E2E_WALLETS_JSON;

// Validation: Ensure the secrets and environment variables are present.
if (!walletsJson) {
  console.error("Error: Secret 'TEST_E2E_WALLETS_JSON' is missing or empty!");
  process.exit(1);
}

if (!runId) {
  console.error('Error: GITHUB_RUN_ID is missing!');
  process.exit(1);
}

try {
  // 1. Parsing the JSON array of wallets
  // Converts the string env var into a usable JavaScript array of strings.
  const wallets: string[] = JSON.parse(walletsJson);
  // Example runId: "21747009794" (passed as string from env)
  const runIdNum = parseInt(runId, 10);

  // Ensure valid format
  if (!Array.isArray(wallets) || wallets.length === 0) {
    throw new Error('E2E_WALLETS_JSON must be a non-empty array.');
  }

  // 2. Deterministic Selection Strategy (Modulo Arithmetic)
  // We use the run ID to pick a wallet index.
  // Formula: index = run_id % total_wallets
  // Example:
  //   - Run ID: 21747009794
  //   - Total Wallets: 10
  //   - Index: 21747009794 % 10 = 4 (The 5th wallet in the list)
  //
  // Why this works:
  // - Distributes load evenly across available wallets for concurrent/sequential runs.
  // - Ensures the same wallet is used for the entire duration of a single workflow run (id is constant).
  const index = runIdNum % wallets.length;
  const selectedKey = wallets[index];

  // 3. Secure Logging
  // Never log the full private key. We mask the middle part to allow debugging
  // (verifying which wallet was picked) without leaking credentials.
  const maskedKey = `${selectedKey.slice(0, 6)}...${selectedKey.slice(-4)}`;
  console.log(`Run ID: ${runIdNum}`);
  console.log(`Strategy: ${runIdNum} % ${wallets.length} = Index ${index}`);
  console.log(`Selected Wallet: ${maskedKey}`);

  // 4. Exporting to GitHub Environment
  // GitHub Actions uses a special file (path stored in GITHUB_ENV) to persist env vars between steps.
  // By appending "KEY=VALUE", we make PRIVATE_KEY available to the next steps (e.g., running tests).
  const envFile = process.env.GITHUB_ENV;
  if (envFile) {
    // SECURITY: Explicitly mask the private key in GitHub Actions logs
    // This prevents the key from appearing in plain text if it's ever printed
    console.log(`::add-mask::${selectedKey}`);

    fs.appendFileSync(envFile, `PRIVATE_KEY=${selectedKey}\n`);
  } else {
    // Fallback for local execution where GITHUB_ENV might not exist.
    // In local runs, you'd typically set PRIVATE_KEY in .env.local manually.
    console.log('GITHUB_ENV not found, exporting to console only.');
  }
} catch (e) {
  console.error('Failed to parse wallets or select key:', e);
  process.exit(1);
}
