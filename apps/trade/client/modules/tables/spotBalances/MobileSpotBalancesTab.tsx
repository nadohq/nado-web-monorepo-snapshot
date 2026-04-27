import { NLP_PRODUCT_ID, QUOTE_PRODUCT_ID } from '@nadohq/client';
import {
  CustomNumberFormatSpecifier,
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { Divider, Pill, SecondaryButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ProductLabel } from 'client/components/ProductLabel';
import { ProductLabelLink } from 'client/components/ProductLabelLink';
import { SpotMoreActionsDropdownMenu } from 'client/components/SpotMoreActionsDropdownMenu';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useShowDialogForProduct } from 'client/hooks/ui/navigation/useShowDialogForProduct';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { ROUTES } from 'client/modules/app/consts/routes';
import { QuoteAmount } from 'client/modules/tables/components/QuoteAmount';
import { useSpotBalancesTable } from 'client/modules/tables/spotBalances/useSpotBalancesTable';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface Props {
  hideSmallBalances?: boolean;
}

export function MobileSpotBalancesTab({ hideSmallBalances }: Props) {
  const { t } = useTranslation();

  const { balances, isLoading } = useSpotBalancesTable({
    hideSmallBalances,
  });

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="spot_balances"
      isLoading={isLoading}
      hasData={!!balances?.length}
    >
      {balances?.map((balance) => {
        const isPrimaryQuote = balance.productId === QUOTE_PRODUCT_ID;

        const pill = (() => {
          if (!balance.amount || balance.amount.isZero()) {
            return null; // do not use pill
          }

          const effectiveAPY = balance.amount.isPositive()
            ? balance.depositAPY
            : balance.borrowAPY;

          const formattedEffectiveAPY = formatNumber(effectiveAPY, {
            formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
          });

          if (balance.amount.isPositive()) {
            return (
              <Pill colorVariant="positive" sizeVariant="xs">
                {t(($) => $.earningRate, { formattedEffectiveAPY })}
              </Pill>
            );
          } else {
            return (
              <Pill colorVariant="negative" sizeVariant="xs">
                {t(($) => $.payingRate, { formattedEffectiveAPY })}
              </Pill>
            );
          }
        })();

        return (
          <MobileDataTabCard.Container key={balance.productId}>
            <MobileDataTabCard.Header>
              <ProductLabelLink productId={balance.productId}>
                <ProductLabel
                  symbol={balance.metadata.token.symbol}
                  iconSrc={balance.metadata.token.icon.asset}
                />
              </ProductLabelLink>
              {pill}
            </MobileDataTabCard.Header>

            <MobileDataTabCard.Body>
              <div className="flex justify-between">
                <ValueWithLabel.Vertical
                  sizeVariant="sm"
                  label={t(($) => $.balanceValue)}
                  tooltip={{ id: 'assetBalance' }}
                  valueContent={
                    <>
                      <span>
                        {formatNumber(balance.balanceInfo.amount, {
                          formatSpecifier:
                            CustomNumberFormatSpecifier.NUMBER_PRECISE,
                        })}{' '}
                        {balance.balanceInfo.symbol}
                      </span>
                      <span className="text-text-tertiary text-xs">
                        {formatNumber(balance.balanceInfo.valueUsd, {
                          formatSpecifier:
                            PresetNumberFormatSpecifier.CURRENCY_2DP,
                        })}
                      </span>
                    </>
                  }
                  valueClassName="flex flex-col gap-1.5"
                />
                <ValueWithLabel.Vertical
                  className="items-end"
                  sizeVariant="sm"
                  label={t(($) => $.estimatedAbbrevPnlRoe)}
                  tooltip={{
                    id: 'estimatedPositionPnL',
                  }}
                  valueContent={
                    <>
                      <span>
                        {formatNumber(balance.estimatedPnlUsd, {
                          formatSpecifier:
                            CustomNumberFormatSpecifier.SIGNED_CURRENCY_2DP,
                        })}
                      </span>
                      <span className="text-xs">
                        {formatNumber(balance.estimatedPnlFrac, {
                          formatSpecifier:
                            PresetNumberFormatSpecifier.PERCENTAGE_2DP,
                        })}
                      </span>
                    </>
                  }
                  valueClassName={joinClassNames(
                    'flex flex-col items-end gap-1.5',
                    getSignDependentColorClassName(balance.estimatedPnlUsd),
                  )}
                />
              </div>

              <Divider />

              <MobileDataTabCard.Cols3>
                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.depositApy)}
                  tooltip={{ id: 'depositAPY' }}
                  value={balance.depositAPY}
                  numberFormatSpecifier={
                    PresetNumberFormatSpecifier.PERCENTAGE_2DP
                  }
                />
                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  className="items-center"
                  label={t(($) => $.borrowApy)}
                  tooltip={{ id: 'borrowAPY' }}
                  value={balance.borrowAPY}
                  numberFormatSpecifier={
                    PresetNumberFormatSpecifier.PERCENTAGE_2DP
                  }
                />
                <ValueWithLabel.Vertical
                  className="items-end"
                  sizeVariant="xs"
                  label={t(($) => $.interest)}
                  valueContent={
                    <QuoteAmount
                      isPrimaryQuote={isPrimaryQuote}
                      quoteAmount={balance.netInterestUnrealized}
                      quoteSymbol={balance.metadata.token.symbol}
                      signDependentColor
                    />
                  }
                />
              </MobileDataTabCard.Cols3>
            </MobileDataTabCard.Body>
            <MobileSpotActionButtons
              productId={balance.productId}
              balanceAmount={balance.balanceInfo.amount}
            />
          </MobileDataTabCard.Container>
        );
      })}
    </MobileDataTabCards>
  );
}

interface MobileSpotActionButtonsProps {
  productId: number;
  balanceAmount: BigNumber;
}

function MobileSpotActionButtons({
  productId,
  balanceAmount,
}: MobileSpotActionButtonsProps) {
  const { t } = useTranslation();

  const showDialogForProduct = useShowDialogForProduct();
  const isConnected = useIsConnected();

  const actions = (() => {
    if (productId === NLP_PRODUCT_ID) {
      return (
        <SecondaryButton
          as={Link}
          href={ROUTES.vault}
          size="sm"
          className="flex-1"
        >
          {t(($) => $.buttons.goToVault)}
        </SecondaryButton>
      );
    }

    return (
      <>
        <SecondaryButton
          className="flex-1"
          size="sm"
          onClick={() =>
            showDialogForProduct({ dialogType: 'deposit_options', productId })
          }
          disabled={!isConnected}
        >
          {t(($) => $.buttons.deposit)}
        </SecondaryButton>
        <SecondaryButton
          className="flex-1"
          size="sm"
          onClick={() =>
            showDialogForProduct({ dialogType: 'withdraw', productId })
          }
          disabled={!isConnected}
        >
          {t(($) => $.buttons.withdraw)}
        </SecondaryButton>
        <SpotMoreActionsDropdownMenu
          triggerSizeVariant="sm"
          productId={productId}
          balanceAmount={balanceAmount}
        />
      </>
    );
  })();

  return <div className="flex gap-x-1 px-3">{actions}</div>;
}
