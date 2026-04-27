import { NextImageSrc } from '@nadohq/web-common';
import tier1 from 'client/modules/points/assets/tier-1.png';
import tier2 from 'client/modules/points/assets/tier-2.png';
import tier3 from 'client/modules/points/assets/tier-3.png';
import tier4 from 'client/modules/points/assets/tier-4.png';
import tier5 from 'client/modules/points/assets/tier-5.png';
import { PointsTier } from 'client/modules/points/types';

interface TierInfo {
  bannerImage: NextImageSrc;
  /** tier identifier (use this for localized name) */
  tierId: `tier${PointsTier}`;
}

export const TIER_INFO_BY_POINTS_TIER: Record<PointsTier, TierInfo> = {
  1: { bannerImage: tier1, tierId: 'tier1' }, // Breeze
  2: { bannerImage: tier2, tierId: 'tier2' }, // Gust
  3: { bannerImage: tier3, tierId: 'tier3' }, // Wind
  4: { bannerImage: tier4, tierId: 'tier4' }, // Storm
  5: { bannerImage: tier5, tierId: 'tier5' }, // Tornado
};
