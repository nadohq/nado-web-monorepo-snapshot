// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { captureRouterTransitionStart, init } from '@sentry/nextjs';
import { sentryEnv } from 'common/environment/sentryEnv';

init({
  dsn: sentryEnv.dsn,
  environment: sentryEnv.envName,
  enabled: sentryEnv.enabled,
  // This is for errors
  sampleRate: 0.1,
  // This is for traces, which aren't that important
  tracesSampleRate: 0.01,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  ignoreErrors: [
    // Origin of this error seems to be from a wallet connection dependency
    "TypeError: Cannot read properties of undefined (reading 'providerType')",
    "TypeError: Cannot read properties of undefined (reading 'code')",
    // Seems like an iOS Webview error
    "Can't find variable: bytecode",
    // Walletconnect
    'Error: WebSocket connection failed for host: wss://relay.walletconnect.org',
    /WebSocket connection closed abnormally with code: 3000 \(JWT validation error: JWT Token is not yet valid:.*/,
    'Socket stalled when trying to connect to wss://relay.walletconnect.org',
    // Weird sentry SDK issue: https://github.com/getsentry/sentry-javascript/issues/2546
    /UnhandledRejection: Object captured as promise rejection with keys:.*/,
    // Another sentry issue: https://github.com/getsentry/sentry-javascript/issues/3440
    /Non-Error promise rejection captured with value: Object Not Found Matching Id.*/,
    // Seems to be from injected connector when talking to RPC - not sure why this is unhandled
    'Request limit exceeded.',
    // RainbowKit internal module resolution - not actionable
    'not found rainbowkit',
    // ENS avatar lookup failure (euc.li is ENS metadata service) - cosmetic
    'Failed to fetch (euc.li)',
    // User intentionally rejected wallet signature/transaction - expected behavior
    /User rejected the request/i,
    // WalletConnect session expired or disconnected - expected during reconnection
    /session topic doesn't exist/i,
    // Caused by Chrome browser translation (e.g., switching to German) which triggers React hydration mismatch, resulting in a 500 error when placing an order.
    /Failed to execute 'removeChild' on 'Node'/i,
    /Cannot read properties of null (reading 'removeChild')/i,
    // WebGL not supported in some browsers/devices - fallback renders fine
    /creating WebGL context/i,
    // AbortController signal aborted (e.g. navigation during fetch)
    /signal is aborted without reason/i,
    // TradingView charting library failed to load static assets
    /There was an error when loading the library\. Usually this error means the library failed to load its static files\. Check that the library files are available at app\.nado\.xyz\/\/charting_library\/ or correct the library_path option\./,
    // TradingView widget not initialized before access attempt - race condition on unmount
    "Cannot read properties of null (reading 'tradingViewApi')",
    // Benign serialization error likely from logging complex objects; does not impact user experience. Does not originate from our code.
    /JSON.stringify cannot serialize cyclic structures./i,
    // User intentionally denied wallet transaction signature - expected behavior
    /Tx Signature: User denied transaction signature./i,
    // User intentionally canceled a transaction - expected behavior
    /\[TransactionError\] Transaction was canceled./i,
  ],
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
  ],
  // replaysOnErrorSampleRate: 0.1,
  // replaysSessionSampleRate: 0.01,
  integrations: [
    // Sentry.replayIntegration({
    //   // Additional Replay configuration goes in here, for example:
    //   maskAllText: true,
    //   blockAllMedia: true,
    // }),
  ],
});

export const onRouterTransitionStart = captureRouterTransitionStart;
