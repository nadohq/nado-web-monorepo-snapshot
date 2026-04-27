import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { CompactInput } from '@nadohq/web-ui';
import { ActionSummary } from 'client/components/ActionSummary';
import { Form } from 'client/components/Form';
import { FractionAmountButtons } from 'client/components/FractionAmountButtons';
import { InputProductSymbolWithIcon } from 'client/components/InputProductSymbolWithIcon';
import { InputSummaryItem } from 'client/components/InputSummaryItem';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MinimumDepositAmount } from 'client/modules/collateral/components/MinimumDepositAmount';
import { Usdt0BridgeSubmitButton } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/components/Usdt0BridgeSubmitButton';
import { Usdt0BridgeSummaryDisclosure } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/components/Usdt0BridgeSummaryDisclosure';
import { useUsdt0BridgeAmountErrorTooltipContent } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/useUsdt0BridgeAmountErrorTooltipContent';
import { useUsdt0BridgeForm } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/hooks/useUsdt0BridgeForm';
import { Usdt0BridgeDialogParams } from 'client/modules/collateral/deposit/Usdt0BridgeDialog/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

/**
 * Dialog component for bridging USDT via Tether's USDT0 protocol.
 * Enables cross-chain USDT deposits from Ethereum, Arbitrum, Optimism, and Polygon.
 */
export function Usdt0BridgeDialog({
  directDepositAddress,
  initialProductId,
  selectedChainId,
}: Usdt0BridgeDialogParams) {
  const { t } = useTranslation();
  const { hide } = useDialog();

  const amountPlaceholder = useNumericInputPlaceholder();

  const {
    formError,
    sourceChainConfig,
    sourceBalance,
    buttonState,
    amountRegister,
    minDepositAmount,
    summary,
    onAmountChange,
    onFractionSelected,
    onMaxAmountSelected,
    onSubmit,
  } = useUsdt0BridgeForm({
    destinationAddress: directDepositAddress,
    initialProductId,
    selectedChainId,
  });

  const amountErrorTooltipContent = useUsdt0BridgeAmountErrorTooltipContent({
    formError,
    minDepositAmount,
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.deposit)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onSubmit}>
          {/* Amount Input */}
          <div className="flex flex-col gap-y-3">
            <CompactInput
              startElement={
                <InputProductSymbolWithIcon
                  productImageSrc={sourceChainConfig?.tokenIcon?.asset}
                  symbol={sourceChainConfig?.tokenSymbol}
                />
              }
              placeholder={amountPlaceholder}
              errorTooltipContent={amountErrorTooltipContent}
              {...amountRegister}
              onChange={onAmountChange}
            />
            <ValueWithLabel.Horizontal
              fitWidth
              sizeVariant="xs"
              label={t(($) => $.chain)}
              labelClassName="label-separator"
              valueContent={
                sourceChainConfig && (
                  <div className="flex items-center gap-x-0.5">
                    <Image
                      src={sourceChainConfig.chainIcon}
                      alt={sourceChainConfig.viemChain.name}
                      className="size-3"
                    />
                    {sourceChainConfig.viemChain.name}
                  </div>
                )
              }
            />
            <InputSummaryItem
              label={t(($) => $.available)}
              currentValue={sourceBalance}
              formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
              onValueClick={onMaxAmountSelected}
            />
          </div>
          <FractionAmountButtons onFractionSelected={onFractionSelected} />
          <div className="flex flex-col gap-y-3">
            <MinimumDepositAmount
              symbol={sourceChainConfig?.tokenSymbol}
              amount={minDepositAmount}
              isInitial={false}
            />
            <ActionSummary.Container>
              <Usdt0BridgeSummaryDisclosure
                receiveAmount={summary.receiveAmount}
                transactionCost={summary.layerZeroFee}
                protocolFee={summary.protocolFee}
                nativeCurrencySymbol={
                  sourceChainConfig?.viemChain.nativeCurrency.symbol
                }
                sourceTokenSymbol={sourceChainConfig?.tokenSymbol}
              />
              <Usdt0BridgeSubmitButton
                state={buttonState}
                requiredConnectedChain={sourceChainConfig?.viemChain}
              />
            </ActionSummary.Container>
          </div>
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
