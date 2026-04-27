import { joinClassNames, WithChildren } from '@nadohq/web-common';
import { TooltipPortalRoot } from '@nadohq/web-ui';
import { AppRootLayout } from 'app/AppRootLayout';
import { ClientLayout } from 'app/ClientLayout';
import { Metadata, Viewport } from 'next';

// Style imports
import 'styles/globals.css';

export default function RootLayout({ children }: WithChildren) {
  return (
    <AppRootLayout>
      <main
        className={joinClassNames(
          'h-dvh w-screen',
          'no-scrollbar overflow-auto',
        )}
      >
        <ClientLayout>
          <div
            className={joinClassNames(
              'mx-auto max-w-[1770px]',
              'flex flex-col gap-y-6',
              'px-4 sm:px-12',
              'py-6 lg:py-12',
            )}
          >
            {children}
          </div>
        </ClientLayout>
      </main>
      <TooltipPortalRoot />
    </AppRootLayout>
  );
}

const seoTitle = 'Nado Stats | DEX Analytics Dashboard';
const seoDescription =
  "Monitor real-time trading volume, TVL, open interest, and user growth across Nado's perpetual markets.";

export const metadata: Metadata = {
  // SEO
  title: {
    default: seoTitle,
    template: `%s | ${seoTitle}`,
  },
  description: seoDescription,
  manifest: '/site.webmanifest',
  // OG Socials
  openGraph: {
    title: seoTitle,
    siteName: seoTitle,
    description: seoDescription,
    images: 'https://app.nado.xyz/preview-banner.png',
  },
  // Twitter
  twitter: {
    site: '@nadohq',
    title: seoTitle,
    description: seoDescription,
    images: 'https://app.nado.xyz/preview-banner.png',
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};
