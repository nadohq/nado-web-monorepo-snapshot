'use client';

import { truncateAddress, useEVMContext } from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Icons, SecondaryButton } from '@nadohq/web-ui';
import { DotsContainer } from 'client/modules/app/gatedAppAccess/gatedBeta/BetaWelcomeScreen/components/DotsContainer';
import { IMAGES } from 'common/brandMetadata/images';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function BetaWelcomeTopBar({ className }: WithClassnames) {
  const { t } = useTranslation();
  const { disconnect, connectionStatus } = useEVMContext();

  const disconnectButton = (() => {
    if (connectionStatus.type !== 'connected') {
      return null;
    }

    return (
      <SecondaryButton
        size="lg"
        onClick={disconnect}
        endIcon={<Icons.Power size={18} />}
        className="mr-3.5"
      >
        {truncateAddress(connectionStatus.address)}
      </SecondaryButton>
    );
  })();

  return (
    <div
      className={joinClassNames('flex items-center justify-between', className)}
    >
      <DotsContainer contentContainerClassName="lg:px-4 lg:py-3 px-2 py-1">
        <Image
          src={IMAGES.brandLogo}
          alt={t(($) => $.imageAltText.brandLogo)}
          className="h-5 w-auto lg:h-10"
        />
      </DotsContainer>
      {disconnectButton}
    </div>
  );
}
