'use client';

import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { MarketsDepositRates } from 'client/pages/Markets/components/cards/MarketsDepositRates/MarketsDepositRates';
import { MarketsRecentlyAdded } from 'client/pages/Markets/components/cards/MarketsRecentlyAdded/MarketsRecentlyAdded';
import {
  COMMON_SWIPER_CLASSNAME,
  COMMON_SWIPER_PROPS,
} from 'client/pages/Markets/components/consts';
import { SwiperNavigation } from 'client/pages/Markets/components/SwiperNavigation';
import { Swiper, SwiperSlide } from 'swiper/react';

export function MarketsSecondCarousel({ className }: WithClassnames) {
  return (
    <Swiper
      {...COMMON_SWIPER_PROPS}
      className={joinClassNames(COMMON_SWIPER_CLASSNAME, className)}
    >
      <SwiperNavigation />
      <SwiperSlide>
        <MarketsDepositRates />
      </SwiperSlide>
      <SwiperSlide>
        <MarketsRecentlyAdded />
      </SwiperSlide>
    </Swiper>
  );
}
