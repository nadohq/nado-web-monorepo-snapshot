import { WithChildren } from '@nadohq/web-common';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/nextjs';

/**
 * Error boundary component to isolate errors in the component tree.
 * Currently uses Sentry's ErrorBoundary for error tracking.
 */
export function ErrorBoundary({ children }: WithChildren) {
  return <SentryErrorBoundary>{children}</SentryErrorBoundary>;
}
