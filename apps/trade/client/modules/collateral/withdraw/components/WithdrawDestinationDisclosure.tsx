import { truncateAddress } from '@nadohq/react-client';
import { InputValidatorFn } from '@nadohq/web-common';
import { CompactInput, DisclosureCard, LinkButton } from '@nadohq/web-ui';
import * as Collapsible from '@radix-ui/react-collapsible';
import {
  WithdrawErrorType,
  WithdrawFormValues,
} from 'client/modules/collateral/withdraw/types';
import { watchFormError } from 'client/utils/form/watchFormError';
import { useState } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { isAddress } from 'viem';

interface Props {
  form: UseFormReturn<WithdrawFormValues>;
  // Connected wallet address, used as the default recipient
  address: string;
  chainName: string;
  validateWithdrawAddress: InputValidatorFn<string, WithdrawErrorType>;
}

export function WithdrawDestinationDisclosure({
  form,
  address,
  chainName,
  validateWithdrawAddress,
}: Props) {
  const { t } = useTranslation();
  const [isRecipientInputOpen, setIsRecipientInputOpen] = useState(false);

  const withdrawAddressInput = useWatch({
    control: form.control,
    name: 'withdrawAddress',
  });

  const withdrawAddressError = watchFormError(form, 'withdrawAddress');

  // An empty / invalid input defaults to the connected wallet (subaccount owner).
  const destinationAddress = isAddress(withdrawAddressInput)
    ? withdrawAddressInput
    : address;
  const destinationLabel = truncateAddress(destinationAddress);

  return (
    <DisclosureCard
      description={
        <div className="flex flex-col gap-y-1.5">
          <p>
            <Trans
              i18nKey={($) => $.withdrawalDestinationDisclosure}
              values={{
                destinationLabel,
                chainName,
              }}
              components={{
                highlight: <span className="text-text-primary" />,
              }}
            />
          </p>
          <Collapsible.Root
            className="flex flex-col gap-y-1.5"
            open={isRecipientInputOpen}
            onOpenChange={setIsRecipientInputOpen}
          >
            <Collapsible.Trigger asChild>
              <LinkButton colorVariant="secondary" className="w-max">
                {t(($) => $.buttons.changeRecipient)}
              </LinkButton>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <CompactInput
                placeholder={t(($) => $.inputPlaceholders.ethereumAddress)}
                inputContainerClassName="bg-surface-2"
                errorTooltipContent={
                  withdrawAddressError
                    ? t(($) => $.errors.invalidAddress)
                    : undefined
                }
                {...form.register('withdrawAddress', {
                  validate: validateWithdrawAddress,
                })}
              />
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
      }
    />
  );
}
