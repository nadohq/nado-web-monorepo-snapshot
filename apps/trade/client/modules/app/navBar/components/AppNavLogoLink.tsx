import { joinClassNames } from '@nadohq/web-common';
import { ROUTES } from 'client/modules/app/consts/routes';
import { IMAGES } from 'common/brandMetadata/images';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface AppNavLogoLinkProps {
  /**
   * Whether to show the small square icon, by default, the full logo is shown.
   */
  showIcon: boolean;
}

export function AppNavLogoLink({ showIcon = false }: AppNavLogoLinkProps) {
  const { t } = useTranslation();

  return (
    <Link href={ROUTES.perpTrading}>
      <Image
        src={showIcon ? IMAGES.brandIcon : IMAGES.brandLogo}
        alt={t(($) => $.imageAltText.logo)}
        className={joinClassNames('w-auto', showIcon ? 'h-5' : 'h-4')}
      />
    </Link>
  );
}
