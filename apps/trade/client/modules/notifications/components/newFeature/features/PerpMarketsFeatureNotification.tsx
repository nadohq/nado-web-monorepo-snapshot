import { ToastProps } from 'client/components/Toast/types';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { FeatureNotificationDisclosureKey } from 'client/modules/localstorage/userState/types/userDisclosureTypes';
import { useShowUserDisclosure } from 'client/modules/localstorage/userState/useShowUserDisclosure';
import { TOAST_MARKET_ICON_CLASSNAME } from 'client/modules/notifications/components/consts';
import { NewFeatureNotification } from 'client/modules/notifications/components/newFeature/NewFeatureNotification';
import { get } from 'lodash';
import Image from 'next/image';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

interface Props extends ToastProps {
  disclosureKey: FeatureNotificationDisclosureKey;
  productIds: number[];
}

export function PerpMarketsFeatureNotification({
  productIds,
  disclosureKey,
  onDismiss,
  ...rest
}: Props) {
  const { t } = useTranslation();

  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const productIdLinks = useProductIdLinks();
  const { dismiss: dismissNewFeatureNotification } =
    useShowUserDisclosure(disclosureKey);

  const onDismissClick = () => {
    onDismiss();
    dismissNewFeatureNotification();
  };

  const content = (
    <div className="flex flex-col gap-y-3">
      <p className="label-separator">
        <Trans
          i18nKey={($) => $.notifications.newPerpMarkets.content}
          values={{ count: productIds.length }}
          components={{
            highlight: <span className="text-text-primary" />,
          }}
        />
      </p>
      <div className="grid max-w-[90%] grid-cols-2 justify-items-start gap-2">
        {productIds.map((productId) => {
          const market = allMarketsStaticData?.perpMarkets[productId];

          if (!market) {
            // Approximate height of the market row to avoid layout shift, this
            // is required because Sonner does not support dynamic height toasts
            return <div key={productId} className="h-4 w-32" />;
          }
          const metadata = market.metadata;
          const productIdLink = get(productIdLinks, productId, '');

          return (
            <Link
              href={productIdLink}
              className="flex items-center gap-x-2"
              key={metadata.marketName}
            >
              <Image
                className={TOAST_MARKET_ICON_CLASSNAME}
                src={metadata.icon.asset}
                alt={metadata.marketName}
              />
              <div className="text-text-primary text-nowrap">
                {metadata.marketName}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <NewFeatureNotification
      title={t(($) => $.notifications.newPerpMarkets.title, {
        count: productIds.length,
      })}
      content={content}
      onDismiss={onDismissClick}
      {...rest}
    />
  );
}
