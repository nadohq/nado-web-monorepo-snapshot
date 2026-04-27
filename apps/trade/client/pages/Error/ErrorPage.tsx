'use client';

import { PrimaryButton } from '@nadohq/web-ui';
import { ROUTES } from 'client/modules/app/consts/routes';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function ErrorPage({ statusCode }: { statusCode: 404 | 500 }) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-screen flex-col items-center justify-center gap-y-12">
      <div className="flex flex-col items-center gap-y-4">
        <div
          className="text-text-secondary text-[10rem] lg:text-[13rem]"
          data-testid="error-page-status-code"
        >
          {statusCode}
        </div>
        <p
          className="text-text-secondary text-3xl"
          data-testid="error-page-status-message"
        >
          {statusCode === 404
            ? t(($) => $.errors.pageNotFound)
            : t(($) => $.errors.serverError)}
        </p>
      </div>
      <PrimaryButton as={Link} href={ROUTES.perpTrading}>
        {t(($) => $.buttons.trade)}
      </PrimaryButton>
    </div>
  );
}
