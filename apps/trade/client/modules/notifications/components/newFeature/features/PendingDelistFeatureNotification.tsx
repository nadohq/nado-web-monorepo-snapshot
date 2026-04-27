import {
  DELIST_REDUCE_ONLY_TIME_MILLIS,
  PENDING_DELIST_PERP_PRODUCT_IDS,
} from '@nadohq/react-client';
import {
  formatTimestamp,
  LinkButton,
  TimeFormatSpecifier,
} from '@nadohq/web-ui';
import { ToastProps } from 'client/components/Toast/types';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePushTradePage } from 'client/hooks/ui/navigation/usePushTradePage';
import { FeatureNotificationDisclosureKey } from 'client/modules/localstorage/userState/types/userDisclosureTypes';
import { useShowUserDisclosure } from 'client/modules/localstorage/userState/useShowUserDisclosure';
import { NewFeatureNotification } from 'client/modules/notifications/components/newFeature/NewFeatureNotification';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { LINKS } from 'common/brandMetadata/links';
import Image from 'next/image';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

interface Props extends ToastProps {
  disclosureKey: FeatureNotificationDisclosureKey;
}

export function PendingDelistFeatureNotification({
  disclosureKey,
  onDismiss: baseOnDismiss,
  ...rest
}: Props) {
  const { t } = useTranslation();

  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const pushTradePage = usePushTradePage();
  const { dismiss: dismissNewFeatureNotification } =
    useShowUserDisclosure(disclosureKey);

  const onDismissClick = () => {
    baseOnDismiss();
    dismissNewFeatureNotification();
  };

  const delistTime = formatTimestamp(DELIST_REDUCE_ONLY_TIME_MILLIS, {
    formatSpecifier: TimeFormatSpecifier.MMM_D_HH_12H_O,
  });

  const content = (
    <div className="flex flex-col items-start gap-y-3">
      <p>
        <Trans
          i18nKey={($) => $.notifications.pendingDelists.description}
          values={{ delistTime, count: PENDING_DELIST_PERP_PRODUCT_IDS.size }}
          components={{
            highlight: <span className="text-text-primary" />,
          }}
        />{' '}
        <LinkButton
          colorVariant="secondary"
          as={Link}
          external
          withExternalIcon
          href={LINKS.may15DelistInfo}
        >
          {t(($) => $.buttons.fullDetails)}
        </LinkButton>
      </p>
      <div className="flex flex-wrap gap-x-2 gap-y-3">
        {Array.from(PENDING_DELIST_PERP_PRODUCT_IDS).map((productId) => {
          const marketStaticData = allMarketsStaticData?.allMarkets[productId];

          if (!marketStaticData) {
            // Approximate height of the market item to avoid layout shift
            // This is required because Sonner does not support dynamic height toasts
            return <div key={productId} className="h-4 w-22" />;
          }
          const sharedProductMetadata = getSharedProductMetadata(
            marketStaticData.metadata,
          );

          return (
            <LinkButton
              colorVariant="secondary"
              className="gap-x-1"
              onClick={() =>
                pushTradePage({
                  productId,
                })
              }
              key={productId}
            >
              <Image
                src={sharedProductMetadata.icon.asset}
                className="h-4 w-auto"
                alt={sharedProductMetadata.marketName}
              />
              {sharedProductMetadata.marketName}
            </LinkButton>
          );
        })}
      </div>
    </div>
  );

  return (
    <NewFeatureNotification
      title={t(($) => $.notifications.pendingDelists.title, {
        count: PENDING_DELIST_PERP_PRODUCT_IDS.size,
      })}
      content={content}
      onDismiss={onDismissClick}
      {...rest}
    />
  );
}
