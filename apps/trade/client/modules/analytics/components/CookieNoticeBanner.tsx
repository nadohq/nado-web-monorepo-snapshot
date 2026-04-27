'use client';

import { joinClassNames } from '@nadohq/web-common';
import { LinkButton, SecondaryButton, Z_INDEX } from '@nadohq/web-ui';
import { useCookiePreference } from 'client/modules/analytics/useCookiePreference';
import { getIsIframe } from 'client/utils/getIsIframe';
import { BRAND_METADATA } from 'common/brandMetadata/brandMetadata';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

export function CookieNoticeBanner() {
  const { t } = useTranslation();
  const isIframe = getIsIframe();
  const {
    areCookiesAccepted,
    didLoadPersistedValue,
    acceptCookies,
    declineCookies,
  } = useCookiePreference();

  // Do not display the cookie notice banner in an iframe, as cookies are not supported in this context.
  const showCookieNotice =
    !isIframe && areCookiesAccepted === null && didLoadPersistedValue;

  if (!showCookieNotice) {
    return null;
  }

  return (
    <div
      className={joinClassNames(
        'flex flex-col gap-x-8 gap-y-4 rounded-2xl px-6 py-3 sm:flex-row',
        'border-stroke bg-background border',
        'fixed bottom-4 mx-4 sm:bottom-10 sm:mx-10',
        Z_INDEX.popover,
      )}
    >
      <div className="flex flex-col gap-y-2">
        <p className="text-sm text-white">{t(($) => $.manageCookies)}</p>
        <p className="text-text-tertiary text-xs">
          <Trans
            i18nKey={($) => $.cookiesNotice}
            values={{ brandName: BRAND_METADATA.displayName }}
            components={{
              action: (
                <LinkButton
                  colorVariant="secondary"
                  href={LINKS.cookiePolicy}
                  external
                  as={Link}
                />
              ),
            }}
          />
        </p>
      </div>
      <ActionButtons
        acceptCookies={acceptCookies}
        declineCookies={declineCookies}
      />
    </div>
  );
}

interface ActionButtonsProps {
  acceptCookies: () => void;
  declineCookies: () => void;
}

function ActionButtons({ acceptCookies, declineCookies }: ActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-x-2 text-sm">
      <SecondaryButton
        size="sm"
        onClick={acceptCookies}
        dataTestId="cookie-notice-banner-accept-all-button"
      >
        {t(($) => $.buttons.acceptAll)}
      </SecondaryButton>
      <SecondaryButton size="sm" onClick={declineCookies}>
        {t(($) => $.buttons.rejectAll)}
      </SecondaryButton>
    </div>
  );
}
