import { Icons, TextButton } from '@nadohq/web-ui';
import { useInterval } from 'ahooks';
import { useRepeatedClickCountHandler } from 'client/hooks/ui/useRepeatedClickCountHandler';
import { BetaActionContent } from 'client/modules/app/gatedAppAccess/gatedBeta/BetaWelcomeScreen/components/BetaActionContent';
import { BetaWelcomeTopBar } from 'client/modules/app/gatedAppAccess/gatedBeta/BetaWelcomeScreen/components/BetaWelcomeTopBar';
import { DecryptedText } from 'client/modules/app/gatedAppAccess/gatedBeta/BetaWelcomeScreen/components/DecryptedText';
import { DotsContainer } from 'client/modules/app/gatedAppAccess/gatedBeta/BetaWelcomeScreen/components/DotsContainer';
import { useSavedGlobalState } from 'client/modules/localstorage/globalState/useSavedGlobalState';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LazyDither = lazy(
  () =>
    import('client/modules/app/gatedAppAccess/gatedBeta/BetaWelcomeScreen/components/Dither'),
);

export function BetaWelcomeScreen() {
  const { t } = useTranslation();

  const { setSavedGlobalState } = useSavedGlobalState();
  const onBypassClick = useRepeatedClickCountHandler({
    handler: (count) => {
      if (count !== 3) {
        return;
      }

      setSavedGlobalState((prev) => {
        return {
          ...prev,
          betaGatingBypass: true,
        };
      });
    },
  });
  const [showBlinker, setShowBlinker] = useState(false);

  useInterval(() => setShowBlinker((prev) => !prev), 500);

  return (
    <>
      <div className="font-brand-mono absolute z-10 flex h-full w-full flex-col justify-center p-2">
        <BetaWelcomeTopBar className="absolute top-2 right-2 left-2" />
        <div className="flex flex-col justify-between gap-6 lg:flex-row">
          <DotsContainer
            contentContainerClassName="text-text-primary max-w-200 px-3 py-12 flex flex-col gap-y-2.5"
            className="min-w-[40%]"
          >
            <div className="text-text-primary font-brand flex items-center gap-x-2 text-[32px] uppercase lg:text-[48px]">
              <DecryptedText text={t(($) => $.privateBeta)} />
              {showBlinker && (
                <div className="bg-text-primary inline h-8 w-5 lg:h-10 lg:w-7" />
              )}
            </div>
            <p className="lg:text-lg" onClick={onBypassClick}>
              {t(($) => $.accessLimitedJoinWaitlistGetYourSpot)}
            </p>
            <div className="mt-8 flex items-center gap-x-4 uppercase lg:gap-x-6">
              <TextButton
                colorVariant="primary"
                as={Link}
                href={LINKS.alphaSignUp}
                external
              >
                [ {t(($) => $.buttons.waitlist)}{' '}
                <Icons.ArrowUpRight className="inline" />]
              </TextButton>
              <TextButton
                colorVariant="primary"
                as={Link}
                href={LINKS.x}
                external
              >
                [ {t(($) => $.buttons.xSocial)}{' '}
                <Icons.ArrowUpRight className="inline" />]
              </TextButton>
            </div>
          </DotsContainer>
          <DotsContainer
            contentContainerClassName="flex items-center justify-center p-3"
            className="min-w-[40%]"
          >
            <BetaActionContent />
          </DotsContainer>
        </div>
      </div>
      <Suspense>
        {/* no fallback is necessary since it's a background effect */}
        <LazyDither className="h-full w-full" />
      </Suspense>
    </>
  );
}
