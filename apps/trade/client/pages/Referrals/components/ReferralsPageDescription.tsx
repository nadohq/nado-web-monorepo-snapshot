'use client';

import { useTranslation } from 'react-i18next';

export function ReferralsPageDescription() {
  const { t } = useTranslation();

  return t(($) => $.referrals.pageDescription);
}
