'use client';

import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { CARD_PADDING_CLASSNAMES, SecondaryButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { TIER_INFO_BY_POINTS_TIER } from 'client/modules/points/tierInfoByPointsTier';
import { PointsTier } from 'client/modules/points/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface PointsTierCardProps {
  lastWeekTier: PointsTier | undefined;
  lastWeekRank: number | undefined;
  lastWeekPoints: BigNumber | undefined;
  allTimeRank: number | undefined;
  allTimePoints: BigNumber | undefined;
}

export function PointsTierCardContent({
  lastWeekTier,
  lastWeekRank,
  lastWeekPoints,
  allTimeRank,
  allTimePoints,
}: PointsTierCardProps) {
  const { t } = useTranslation();

  const { show } = useDialog();
  const userTier = lastWeekTier ?? 1;
  const { bannerImage } = TIER_INFO_BY_POINTS_TIER[userTier];

  return (
    <div>
      <Image src={bannerImage} alt="" className="h-auto w-full" quality={100} />
      <div
        className={joinClassNames(
          'flex flex-col gap-y-6',
          CARD_PADDING_CLASSNAMES.box,
        )}
      >
        <div className="grid grid-cols-2 gap-6">
          <ValueWithLabel.Vertical
            label={t(($) => $.weeklyRank)}
            value={lastWeekRank}
            numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
          />
          <ValueWithLabel.Vertical
            label={t(($) => $.lastWeekPoints)}
            value={lastWeekPoints}
            numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
          />
          <ValueWithLabel.Vertical
            label={t(($) => $.allTimeRank)}
            value={allTimeRank}
            numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
          />
          <ValueWithLabel.Vertical
            label={t(($) => $.allTimePoints)}
            value={allTimePoints}
            numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
          />
        </div>
        <SecondaryButton
          dataTestId="points-tier-card-content-share-button"
          onClick={() => {
            show({
              type: 'points_tier_share',
              params: {
                tier: userTier,
                allTimeRank,
                lastWeekRank,
              },
            });
          }}
        >
          {t(($) => $.buttons.shareOnX)}
        </SecondaryButton>
      </div>
    </div>
  );
}
