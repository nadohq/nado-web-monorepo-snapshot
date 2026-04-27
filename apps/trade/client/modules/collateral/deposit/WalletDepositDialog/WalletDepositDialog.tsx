import {
  CustomNumberFormatSpecifier,
  SEQUENCER_FEE_AMOUNT_USDT,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { ButtonHelperInfo, DisclosureCard, LinkButton } from '@nadohq/web-ui';
import { ActionSummary } from 'client/components/ActionSummary';
import { Form } from 'client/components/Form';
import { FractionAmountButtons } from 'client/components/FractionAmountButtons';
import { InputSummaryItem } from 'client/components/InputSummaryItem';
import { UserDisclosureDismissibleCard } from 'client/components/UserDisclosureDismissibleCard';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { useIsSmartContractWalletConnected } from 'client/hooks/util/useIsSmartContractWalletConnected';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { CollateralSelectInput } from 'client/modules/collateral/components/CollateralSelectInput';
import { DepositSummaryDisclosure } from 'client/modules/collateral/components/DepositSummaryDisclosure';
import { MinimumDepositAmount } from 'client/modules/collateral/components/MinimumDepositAmount';
import { useDepositAmountErrorTooltipContent } from 'client/modules/collateral/deposit/hooks/useDepositAmountErrorTooltipContent';
import { useDepositForm } from 'client/modules/collateral/deposit/hooks/useDepositForm';
import { DepositApproveWarning } from 'client/modules/collateral/deposit/WalletDepositDialog/DepositApproveWarning';
import { DepositSubmitButton } from 'client/modules/collateral/deposit/WalletDepositDialog/DepositSubmitButton';
import { WalletDepositDialogParams } from 'client/modules/collateral/deposit/WalletDepositDialog/types';
import { LINKS } from 'common/brandMetadata/links';
import Image from 'next/image';
import Link from 'next/link';
import { Trans, useTranslation } from 'react-i18next';

export function WalletDepositDialog({
  initialProductId,
}: WalletDepositDialogParams) {
  const { t } = useTranslation();

  const { hide } = useDialog();
  const {
    form,
    formError,
    selectedProduct,
    availableProducts,
    buttonState,
    estimateStateTxs,
    amountInputValueUsd,
    displayedInfoCardType,
    isInitialDeposit,
    minDepositAmount,
    validateAmount,
    onFractionSelected,
    onSubmit,
    onMaxAmountSelected,
  } = useDepositForm({ initialProductId });
  const {
    primaryQuoteToken: { symbol: primaryQuoteTokenSymbol },
    primaryChainEnvMetadata: { chainIcon, chainName: primaryChainName },
  } = useNadoMetadataContext();

  const { register, setValue } = form;
  const amountErrorTooltipContent = useDepositAmountErrorTooltipContent({
    formError,
    minDepositAmount,
  });

  const amountPlaceholder = useNumericInputPlaceholder();

  const isSmartContractWalletConnected = useIsSmartContractWalletConnected();
  const showOneClickTradingPrompt =
    isInitialDeposit && isSmartContractWalletConnected;

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.walletDeposit)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onSubmit}>
          <UserDisclosureDismissibleCard
            disclosureKey="deposit_get_started"
            title={t(($) => $.getStartedOnChain, {
              primaryChainName,
            })}
            description={
              <p>
                {t(($) => $.getStartedDescription, {
                  primaryChainName,
                })}{' '}
                <LinkButton
                  colorVariant="secondary"
                  as={Link}
                  href={LINKS.onboardingTutorial}
                  external
                >
                  {t(($) => $.buttons.viewTutorial)}
                </LinkButton>
              </p>
            }
          />
          {showOneClickTradingPrompt && (
            <DisclosureCard
              title={t(($) => $.enableOneClickTrading)}
              description={
                <Trans
                  i18nKey={($) => $.smartContractWalletWarning}
                  values={{
                    primaryQuoteTokenSymbol,
                    SEQUENCER_FEE_AMOUNT_USDT,
                  }}
                  components={{
                    highlight: <span className="text-text-primary" />,
                  }}
                />
              }
            />
          )}
          <div className="flex flex-col gap-y-3">
            <CollateralSelectInput
              {...register('amount', {
                validate: validateAmount,
              })}
              dataTestId="wallet-deposit-amount-input"
              placeholder={amountPlaceholder}
              estimatedValueUsd={amountInputValueUsd}
              selectProps={{
                selectedProduct,
                availableProducts,
                assetAmountTitle: t(($) => $.available),
                onProductSelected: (productId) => {
                  // Skip validation and other states as you can only select from available options
                  setValue('productId', productId);
                },
              }}
              error={amountErrorTooltipContent}
              onFocus={() => {
                setValue('amountSource', 'absolute');
              }}
            />
            <div className="flex flex-col gap-y-3">
              {/*Need to use the base component of InputSummaryItem here as*/}
              {/*InputSummaryItem does not support custom `valueContent`*/}
              <ValueWithLabel.Horizontal
                fitWidth
                sizeVariant="xs"
                label={t(($) => $.chain)}
                labelClassName="label-separator"
                valueContent={
                  <div className="flex items-center gap-x-0.5">
                    <Image
                      src={chainIcon}
                      alt={primaryChainName}
                      className="size-3"
                    />
                    {primaryChainName}
                  </div>
                }
              />
              <InputSummaryItem
                label={t(($) => $.available)}
                currentValue={selectedProduct?.decimalAdjustedWalletBalance}
                formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
                onValueClick={onMaxAmountSelected}
                dataTestId="wallet-deposit-available-button"
              />
            </div>
          </div>
          <FractionAmountButtons onFractionSelected={onFractionSelected} />
          {buttonState === 'approve_idle' && (
            <DepositApproveWarning symbol={selectedProduct?.symbol ?? ''} />
          )}
          <div className="flex flex-col gap-y-3">
            {/*Only show min initial deposit when a user requires deposit */}
            {isInitialDeposit && (
              <MinimumDepositAmount
                symbol={selectedProduct?.symbol}
                amount={
                  selectedProduct?.decimalAdjustedMinimumInitialDepositAmount
                }
                isInitial
              />
            )}
            <ButtonHelperInfo.Container>
              <ActionSummary.Container>
                <DepositSummaryDisclosure
                  displayedInfoCardType={displayedInfoCardType}
                  estimateStateTxs={estimateStateTxs}
                  productId={selectedProduct?.productId}
                  symbol={selectedProduct?.symbol}
                  isHighlighted={buttonState === 'idle'}
                />
                <DepositSubmitButton state={buttonState} />
              </ActionSummary.Container>
              {buttonState === 'approve_success' && (
                <ButtonHelperInfo.Content>
                  {t(($) => $.approveSuccessInfo)}
                </ButtonHelperInfo.Content>
              )}
            </ButtonHelperInfo.Container>
          </div>
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
