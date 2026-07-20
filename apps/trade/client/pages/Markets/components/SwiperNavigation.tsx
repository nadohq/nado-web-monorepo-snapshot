import { joinClassNames } from '@nadohq/web-common';
import { IconButton, Icons } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';
import { useSwiper } from 'swiper/react';

export function SwiperNavigation() {
  const { t } = useTranslation();
  const swiper = useSwiper();

  const iconClassName = 'pointer-events-auto';

  return (
    <div
      className={joinClassNames(
        'absolute top-3 right-2 z-10',
        'pointer-events-none flex gap-x-3 px-2',
      )}
    >
      <IconButton
        className={iconClassName}
        size="xs"
        icon={Icons.CaretLeft}
        aria-label={t(($) => $.buttons.previousSlide)}
        onClick={() => swiper?.slidePrev()}
      />
      <IconButton
        className={iconClassName}
        size="xs"
        icon={Icons.CaretRight}
        aria-label={t(($) => $.buttons.nextSlide)}
        onClick={() => swiper?.slideNext()}
      />
    </div>
  );
}
