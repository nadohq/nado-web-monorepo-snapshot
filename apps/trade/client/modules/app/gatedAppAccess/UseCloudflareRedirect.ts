import {
  QueryDisabledError,
  usePrimaryChainNadoClient,
} from '@nadohq/react-client';
import { useQuery } from '@tanstack/react-query';
import { useRunOnceOnCondition } from 'client/hooks/util/useRunOnceOnCondition';

const ALLOWED_DOMAINS = new Set(['testnet.nado.xyz', 'app.nado.xyz']);

/**
 * Checks if CF requires authorization via a JS challenge. If so, redirects to the relevant `/challenge` page
 * which should redirect the user back to the app.
 */
export function useCloudflareRedirect() {
  const nadoClient = usePrimaryChainNadoClient();

  // the /cf-check endpoint only allows CORS for production endpoints
  const isCorsAllowedHost = (() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return ALLOWED_DOMAINS.has(window.location.hostname);
  })();

  const disabled = !nadoClient || !isCorsAllowedHost;

  const { data: requiresCloudflareAuth } = useQuery({
    queryKey: ['requiresCloudflareAuth'],
    queryFn: async () => {
      // !nadoClient check is to make TS happy
      if (disabled || !nadoClient) {
        throw new QueryDisabledError();
      }
      return nadoClient.context.engineClient.getRequiresCloudflareAuth();
    },
    enabled: !disabled,
  });

  // We don't want to keep trying to replace the page, so enforce that we run this only once
  useRunOnceOnCondition(
    Boolean(requiresCloudflareAuth) && typeof window !== 'undefined',
    () => {
      // The checks here should be guaranteed based on the above condition & existence of `requiresAuth`
      if (nadoClient && typeof window !== 'undefined') {
        window.location.replace(
          `${nadoClient.context.engineClient.opts.url}/challenge`,
        );
      }
    },
  );
}
