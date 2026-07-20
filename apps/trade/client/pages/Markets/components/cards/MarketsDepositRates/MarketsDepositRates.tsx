import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MarketsCardContent } from 'client/pages/Markets/components/cards/MarketsCardContent';
import { MarketsCardItemButton } from 'client/pages/Markets/components/cards/MarketsCardItemButton';
import { useMarketsDepositRates } from 'client/pages/Markets/components/cards/MarketsDepositRates/useMarketsDepositRates';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function MarketsDepositRates() {
  const { t } = useTranslation();
  const { depositRates, isLoading, isConnected } = useMarketsDepositRates();
  const { show } = useDialog();

  return (
    <MarketsCardContent
      title={t(($) => $.marketsPage.topDepositRates)}
      isLoading={isLoading}
    >
      <div
        className={joinClassNames(
          'grid gap-2',
          depositRates && depositRates.length >= 3
            ? 'grid-cols-2'
            : 'grid-cols-1',
        )}
      >
        {depositRates?.map(({ metadata, depositAPY, productId }) => {
          return (
            <MarketsCardItemButton
              onClick={() => {
                if (!isConnected) {
                  return;
                }

                show({
                  type: 'deposit_entrypoint',
                  params: { initialProductId: productId },
                });
              }}
              key={metadata.token.symbol}
              label={
                <>
                  <Image
                    src={metadata.token.icon.asset}
                    alt={metadata.token.symbol}
                    className="size-4"
                  />
                  {metadata.token.symbol}
                </>
              }
              value={depositAPY}
              valueClassName="text-positive"
              numberFormatSpecifier={PresetNumberFormatSpecifier.PERCENTAGE_2DP}
            />
          );
        })}
      </div>
    </MarketsCardContent>
  );
}
