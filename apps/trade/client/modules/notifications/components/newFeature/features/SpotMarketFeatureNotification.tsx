import { joinClassNames } from '@nadohq/web-common';
import { LinkButton } from '@nadohq/web-ui';
import { TOAST_WIDTH } from 'client/components/Toast/consts';
import { ToastProps } from 'client/components/Toast/types';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { useShowDialogForProduct } from 'client/hooks/ui/navigation/useShowDialogForProduct';
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
  productId: number;
}

export function SpotMarketFeatureNotification({
  disclosureKey,
  productId,
  onDismiss: baseOnDismiss,
  ...rest
}: Props) {
  const { t } = useTranslation();

  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const showDialogForProduct = useShowDialogForProduct();
  const productIdLinks = useProductIdLinks();

  const { dismiss: dismissNewFeatureNotification } =
    useShowUserDisclosure(disclosureKey);

  const onDismiss = () => {
    baseOnDismiss();
    dismissNewFeatureNotification();
  };

  const onDepositClick = () => {
    showDialogForProduct({
      dialogType: 'deposit_options',
      productId,
    });
    onDismiss();
  };

  const onTradeClick = () => {
    onDismiss();
  };

  const metadata = allMarketsStaticData?.spotMarkets[productId]?.metadata;

  if (!metadata) {
    // Approximate height of NewFeatureNotification to avoid layout shift
    // This is required because Sonner does not support dynamic height toasts
    return <div className={joinClassNames('h-32', TOAST_WIDTH)} />;
  }

  const marketName = metadata.marketName;
  const symbol = metadata.token.symbol;
  const icon = metadata.token.icon;

  const productIdLink = get(productIdLinks, productId, undefined);

  const content = (
    <div className="flex flex-col gap-y-3">
      <p>
        <Trans
          i18nKey={($) => $.notifications.newSpotMarket.description}
          values={{ symbol, marketName }}
        />
      </p>
      <div className="flex items-center gap-x-2">
        <Image
          className={TOAST_MARKET_ICON_CLASSNAME}
          src={icon.asset}
          alt={symbol}
        />
        <LinkButton colorVariant="primary" onClick={onDepositClick}>
          {t(($) => $.buttons.depositSymbol, { symbol })}
        </LinkButton>
        {productIdLink && (
          <LinkButton
            as={Link}
            colorVariant="primary"
            href={productIdLink}
            onClick={onTradeClick}
          >
            {t(($) => $.buttons.tradeMarketName, { marketName })}
          </LinkButton>
        )}
      </div>
    </div>
  );

  return (
    <NewFeatureNotification
      title={t(($) => $.notifications.newSpotMarket.title)}
      content={content}
      onDismiss={onDismiss}
      {...rest}
    />
  );
}
