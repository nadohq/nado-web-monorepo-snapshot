import { joinClassNames } from '@nadohq/web-common';
import { Card, LinkButton } from '@nadohq/web-ui';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import icon1 from 'client/modules/trading/components/AccountInfoCard/assets/icon-1.png';
import icon2 from 'client/modules/trading/components/AccountInfoCard/assets/icon-2.png';
import xStocksLogo from 'client/modules/trading/components/AccountInfoCard/assets/xstocks-logo.svg';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function XStocksPromoCard() {
  const { t } = useTranslation();

  const { show } = useDialog();
  const isConnected = useIsConnected();

  const handleDeposit = () => {
    show({
      type: 'deposit_entrypoint',
      params: {},
    });
  };

  return (
    <Card
      className={joinClassNames(
        'relative overflow-hidden',
        'bg-surface-1 border-stroke border',
      )}
    >
      {/*right padding used to discourage text from overlapping the decorative icons*/}
      {/* z-10 keeps text above the decorative icons if long copy reaches the reserved zone */}
      <div className="relative z-10 flex flex-col items-start gap-y-1 pr-13">
        <div className="text-text-primary text-xs font-medium">
          <p>{t(($) => $.xStocksLaunchPromo.title)}</p>
          <p>{t(($) => $.xStocksLaunchPromo.description)}</p>
        </div>
        {isConnected && (
          <LinkButton
            colorVariant="secondary"
            onClick={handleDeposit}
            className="text-xs"
          >
            {t(($) => $.buttons.depositNow)}
          </LinkButton>
        )}
      </div>
      <Image
        src={xStocksLogo}
        alt=""
        className="absolute top-1/2 right-4 size-12 -translate-y-1/2 blur-xs"
      />
      <Image src={icon2} alt="" className="absolute top-7 right-6 size-8" />
      <Image src={icon1} alt="" className="absolute top-3 right-12 size-8" />
    </Card>
  );
}
