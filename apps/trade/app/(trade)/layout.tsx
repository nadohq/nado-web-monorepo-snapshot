import { WithChildren } from '@nadohq/web-common';
import { TooltipPortalRoot, Z_INDEX } from '@nadohq/web-ui';
import { CookieNoticeBanner } from 'client/modules/analytics/components/CookieNoticeBanner';
import { AppDialogs } from 'client/modules/app/AppDialogs';
import { AppFooter } from 'client/modules/app/AppFooter';
import { AppListeners } from 'client/modules/app/AppListeners';
import { AppProviders } from 'client/modules/app/AppProviders';
import { AppRootLayout } from 'client/modules/app/AppRootLayout';
import { AppBanners } from 'client/modules/app/components/banners/AppBanners';
import { GatedBetaWrapper } from 'client/modules/app/gatedAppAccess/gatedBeta/GatedBetaWrapper';
import { AppNavBar } from 'client/modules/app/navBar/AppNavBar';
import { BRAND_METADATA } from 'common/brandMetadata/brandMetadata';
import { Metadata, Viewport } from 'next';
import { getT } from 'server/i18n/i18n';

// Style imports
import 'styles/globals.css';

export default function AppLayout({ children }: WithChildren) {
  return (
    <AppRootLayout>
      <AppProviders>
        {/*Components displayed in-page*/}
        <GatedBetaWrapper>
          <AppBanners />
          <AppNavBar className={Z_INDEX.navbar} />
          <div
            // Hide horizontal overflow to ensure that tables never expand fully, but allow vertical scrolling
            className="no-scrollbar flex-1 overflow-x-hidden overscroll-none"
          >
            {children}
          </div>
          <AppFooter className="hidden lg:flex" />
        </GatedBetaWrapper>
        <CookieNoticeBanner />
        {/*Dialogs & listeners*/}
        <AppDialogs />
        <AppListeners />
      </AppProviders>
      <TooltipPortalRoot />
    </AppRootLayout>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();

  const seoTitle = t(($) => $.seo.title);
  const seoDescription = t(($) => $.seo.description);

  return {
    // SEO
    title: {
      default: seoTitle,
      template: `%s | ${BRAND_METADATA.displayName}`,
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
}

export const viewport: Viewport = {
  themeColor: '#000000',
  initialScale: 1,
  maximumScale: 1,
  width: 'device-width',
};
