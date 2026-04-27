'use client';

import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { LinkButton, SectionedCard } from '@nadohq/web-ui';
import { TextCountdown } from 'client/components/Countdown/TextCountdown';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { APP_PAGE_PADDING } from 'client/modules/app/consts/padding';
import desktopBanner from 'client/pages/Points/assets/season-banner-desktop.png';
import mobileBanner from 'client/pages/Points/assets/season-banner-mobile.png';
import { PointsTable } from 'client/pages/Points/components/PointsTable/PointsTable';
import { PointsTierCardContent } from 'client/pages/Points/components/PointsTierCardContent';
import { usePointsPageData } from 'client/pages/Points/usePointsPageData';
import { LINKS } from 'common/brandMetadata/links';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function PointsPage() {
  const { t } = useTranslation();

  const { data } = usePointsPageData();
  return (
    <div className="flex flex-col">
      <Image
        src={desktopBanner}
        alt=""
        className="hidden h-auto sm:block"
        quality={100}
      />
      <Image
        src={mobileBanner}
        alt=""
        className="h-auto w-full sm:hidden"
        quality={100}
      />
      <div
        className={joinClassNames(
          APP_PAGE_PADDING.horizontal,
          APP_PAGE_PADDING.vertical,
          // w-full needed here to allow tables to scroll
          'flex w-full max-w-500 flex-col gap-y-6 self-center pt-8 lg:gap-y-10 lg:pt-10',
        )}
      >
        <div className="flex flex-wrap gap-6">
          <ValueWithLabel.Vertical
            sizeVariant="xl"
            label={t(($) => $.nextSnapshot)}
            valueContent={
              <TextCountdown
                endTimeMillis={data?.nextEpochCutoffTimeMillis}
                unitClassName="text-sm"
              />
            }
          />
          <ValueWithLabel.Vertical
            sizeVariant="xl"
            label={t(($) => $.weeklyPoints)}
            // Hardcoded amount for weekly total points
            value={950_000}
            numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
          />
        </div>
        <div className="flex flex-col-reverse gap-6 lg:flex-row">
          <SectionedCard className="lg:w-2/3">
            <SectionedCard.Header className="flex items-center justify-between">
              {t(($) => $.distributionHistory)}
              <LinkButton
                colorVariant="secondary"
                as={Link}
                href={LINKS.pointsDocs}
                external
                withExternalIcon
              >
                {t(($) => $.buttons.docs)}
              </LinkButton>
            </SectionedCard.Header>
            <SectionedCard.Content className="p-0">
              <PointsTable />
            </SectionedCard.Content>
          </SectionedCard>
          <SectionedCard className="lg:flex-1">
            <SectionedCard.Header>
              {t(($) => $.yourWeeklyTier)}
            </SectionedCard.Header>
            <SectionedCard.Content className="p-0">
              <PointsTierCardContent
                lastWeekTier={data?.lastWeekTier}
                allTimePoints={data?.allTimePoints}
                allTimeRank={data?.allTimeRank}
                lastWeekPoints={data?.lastWeekPoints}
                lastWeekRank={data?.lastWeekRank}
              />
            </SectionedCard.Content>
          </SectionedCard>
        </div>
      </div>
    </div>
  );
}
