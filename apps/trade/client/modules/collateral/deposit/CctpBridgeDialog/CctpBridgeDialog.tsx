import { CustomNumberFormatSpecifier } from '@nadohq/react-client';
import { ButtonHelperInfo, CompactInput } from '@nadohq/web-ui';
import { ActionSummary } from 'client/components/ActionSummary';
import { Form } from 'client/components/Form';
import { FractionAmountButtons } from 'client/components/FractionAmountButtons';
import { InputProductSymbolWithIcon } from 'client/components/InputProductSymbolWithIcon';
import { InputSummaryItem } from 'client/components/InputSummaryItem';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useSanitizedNumericOnChange } from 'client/hooks/ui/form/useSanitizedNumericOnChange';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MinimumDepositAmount } from 'client/modules/collateral/components/MinimumDepositAmount';
import { CctpBridgeSubmitButton } from 'client/modules/collateral/deposit/CctpBridgeDialog/components/CctpBridgeSubmitButton';
import { CctpBridgeSummaryDisclosure } from 'client/modules/collateral/deposit/CctpBridgeDialog/components/CctpBridgeSummaryDisclosure';
import { USDC_TOKEN_INFO } from 'client/modules/collateral/deposit/CctpBridgeDialog/config';
import { useCctpBridgeAmountErrorTooltipContent } from 'client/modules/collateral/deposit/CctpBridgeDialog/hooks/useCctpBridgeAmountErrorTooltipContent';
import { useCctpBridgeForm } from 'client/modules/collateral/deposit/CctpBridgeDialog/hooks/useCctpBridgeForm';
import type { CctpBridgeDialogParams } from 'client/modules/collateral/deposit/CctpBridgeDialog/types';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

/**
 * Dialog component for bridging USDC via Circle's CCTP protocol.
 * Enables cross-chain USDC transfers to Ink from supported source chains.
 */
export function CctpBridgeDialog({
  directDepositAddress,
  initialProductId,
  selectedChainId,
}: CctpBridgeDialogParams) {
  const { hide } = useDialog();
  const { t } = useTranslation();

  const {
    form,
    formError,
    sourceChainConfig,
    sourceBalance,
    buttonState,
    summary,
    validateAmount,
    onFractionSelected,
    onMaxAmountSelected,
    onSubmit,
    minDepositAmount,
  } = useCctpBridgeForm({
    destinationAddress: directDepositAddress,
    initialProductId,
    selectedChainId,
  });

  const { register } = form;
  const errorTooltipContent = useCctpBridgeAmountErrorTooltipContent({
    formError,
    minDepositAmount,
  });

  const amountInputRegister = register('amount', { validate: validateAmount });
  const onAmountChange = useSanitizedNumericOnChange(
    amountInputRegister.onChange,
  );

  const amountPlaceholder = useNumericInputPlaceholder();

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.deposit)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onSubmit}>
          <div className="flex flex-col gap-y-3">
            <CompactInput
              {...amountInputRegister}
              placeholder={amountPlaceholder}
              onChange={onAmountChange}
              startElement={
                <InputProductSymbolWithIcon
                  productImageSrc={USDC_TOKEN_INFO.icon.asset}
                  symbol={USDC_TOKEN_INFO.symbol}
                />
              }
              errorTooltipContent={errorTooltipContent}
            />
            <ValueWithLabel.Horizontal
              fitWidth
              sizeVariant="xs"
              label={t(($) => $.chain)}
              labelClassName="label-separator"
              valueContent={
                <div className="flex items-center gap-x-0.5">
                  <Image
                    src={sourceChainConfig.chainIcon}
                    alt={sourceChainConfig.viemChain.name}
                    className="size-3"
                  />
                  {sourceChainConfig.viemChain.name}
                </div>
              }
            />
            <InputSummaryItem
              label={t(($) => $.available)}
              currentValue={sourceBalance}
              formatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
              onValueClick={onMaxAmountSelected}
              valueEndElement={USDC_TOKEN_INFO.symbol}
            />
          </div>
          <FractionAmountButtons onFractionSelected={onFractionSelected} />
          <div className="flex flex-col gap-y-3">
            <MinimumDepositAmount
              symbol={USDC_TOKEN_INFO.symbol}
              amount={minDepositAmount}
              isInitial={false}
            />
            <ButtonHelperInfo.Container>
              <ActionSummary.Container>
                <CctpBridgeSummaryDisclosure
                  receiveAmount={summary?.receiveAmount}
                  useFastTransfer={sourceChainConfig.supportsFastTransfer}
                  transactionCost={summary?.gasFees}
                  protocolFee={summary?.protocolFee}
                  relayFee={summary?.relayFee}
                  nativeCurrencySymbol={
                    sourceChainConfig.viemChain.nativeCurrency.symbol
                  }
                />
                <CctpBridgeSubmitButton
                  state={buttonState}
                  requiredConnectedChain={sourceChainConfig.viemChain}
                />
              </ActionSummary.Container>
              <ButtonHelperInfo.Content>
                {t(($) => $.bridgeUsdcApprovalInfo)}
              </ButtonHelperInfo.Content>
            </ButtonHelperInfo.Container>
          </div>
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
