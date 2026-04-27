'use client';

import { REACT_QUERY_CONFIG } from '@nadohq/react-client';
import { WithChildren } from '@nadohq/web-common';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AnalyticsContextProvider } from 'client/modules/analytics/AnalyticsContextProvider';
import { AppDataProviders } from 'client/modules/app/appData/AppDataProviders';
import { NotificationManagerContextProvider } from 'client/modules/notifications/NotificationManagerContextProvider';
import { FuulReferralsProvider } from 'client/modules/referrals/FuulReferralsContext';
import i18nInstance from 'common/i18n/i18n';
import { Provider as JotaiProvider } from 'jotai';
import { Suspense } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

i18nInstance.use(initReactI18next);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: REACT_QUERY_CONFIG.defaultQueryStaleTime,
    },
  },
});

export function AppProviders({ children }: WithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        {/*
        Suspense boundary needed for `AppDataProviders` since it is using `useSearchParams` to avoid forcing
        the whole site into client-side rendering.
        See https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
        */}
        <Suspense>
          <I18nextProvider i18n={i18nInstance}>
            <AppDataProviders>
              <FuulReferralsProvider>
                <NotificationManagerContextProvider>
                  <AnalyticsContextProvider>
                    {children}
                  </AnalyticsContextProvider>
                </NotificationManagerContextProvider>
              </FuulReferralsProvider>
            </AppDataProviders>
          </I18nextProvider>
        </Suspense>
      </JotaiProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
