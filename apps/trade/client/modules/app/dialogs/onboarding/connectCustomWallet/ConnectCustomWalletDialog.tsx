import {
  AppManagedWalletConnector,
  isPrivateKey,
  KNOWN_CONNECTOR_IDS,
  useEVMContext,
} from '@nadohq/react-client';
import { InputValidatorFn } from '@nadohq/web-common';
import {
  CompactInput,
  CompactInputProps,
  Input,
  PrimaryButton,
} from '@nadohq/web-ui';
import { Form } from 'client/components/Form';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import {
  ConnectCustomWalletErrorType,
  ConnectCustomWalletFormValues,
} from 'client/modules/app/dialogs/onboarding/connectCustomWallet/types';
import { watchFormError } from 'client/utils/form/watchFormError';
import {
  addressValidator,
  privateKeyValidator,
} from 'client/utils/inputValidators';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { isAddress } from 'viem';
import { useConnect } from 'wagmi';

export function ConnectCustomWalletDialog() {
  const { t } = useTranslation();
  const { connect } = useEVMContext();
  const { connectors } = useConnect();
  const { hide } = useDialog();

  const customWalletConnector = useMemo(() => {
    return connectors.find(
      (connector) => connector.id === KNOWN_CONNECTOR_IDS.customWallet,
    ) as AppManagedWalletConnector | undefined;
  }, [connectors]);

  const form = useForm<ConnectCustomWalletFormValues>({
    mode: 'onTouched',
    defaultValues: {
      signingKey: '',
      customAddress: '',
    },
  });

  const validatePrivateKey = useCallback<
    InputValidatorFn<string, ConnectCustomWalletErrorType>
  >((val) => {
    if (!val) {
      return;
    }
    if (!privateKeyValidator.safeParse(val).success) {
      return 'invalid_input';
    }
  }, []);

  const validateAddress = useCallback<
    InputValidatorFn<string, ConnectCustomWalletErrorType>
  >((val) => {
    if (!val) {
      return;
    }
    if (!addressValidator.safeParse(val).success) {
      return 'invalid_input';
    }
  }, []);

  const signingKeyError: ConnectCustomWalletErrorType | undefined =
    watchFormError(form, 'signingKey');
  const customAddressError: ConnectCustomWalletErrorType | undefined =
    watchFormError(form, 'customAddress');

  const onSubmit = (values: ConnectCustomWalletFormValues) => {
    if (!customWalletConnector) {
      return;
    }

    const signingKey = isPrivateKey(values.signingKey)
      ? values.signingKey
      : undefined;
    const customAddress = isAddress(values.customAddress)
      ? values.customAddress
      : null;

    customWalletConnector.setAddressOverride(customAddress);
    if (signingKey) {
      customWalletConnector.setPrivateKey(signingKey);
    }

    connect(customWalletConnector);
    hide();
  };

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.connectCustomWallet)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={form.handleSubmit(onSubmit)}>
          <InputSection
            label={t(($) => $.connectCustomWalletDialog.signingPrivateKey)}
            helpText={t(($) => $.connectCustomWalletDialog.signingKeyHelpText)}
            inputName="signingKey"
            inputProps={{
              placeholder: t(($) => $.inputPlaceholders.ethereumAddress),
              type: 'password',
              errorTooltipContent: signingKeyError
                ? t(($) => $.errors.invalidPrivateKeyFormat)
                : undefined,
              ...form.register('signingKey', {
                validate: validatePrivateKey,
              }),
            }}
          />
          <InputSection
            label={t(($) => $.connectCustomWalletDialog.customAddressLabel)}
            helpText={t(
              ($) => $.connectCustomWalletDialog.customAddressHelpText,
            )}
            inputName="customAddress"
            inputProps={{
              placeholder: t(($) => $.inputPlaceholders.ethereumAddress),
              errorTooltipContent: customAddressError
                ? t(($) => $.errors.invalidAddress)
                : undefined,
              ...form.register('customAddress', {
                validate: validateAddress,
              }),
            }}
          />
          <PrimaryButton type="submit">
            {t(($) => $.buttons.connect)}
          </PrimaryButton>
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}

interface InputSectionProps {
  inputProps: CompactInputProps;
  helpText: string;
  label: string;
  inputName: string;
}

function InputSection({
  inputProps,
  helpText,
  label,
  inputName,
}: InputSectionProps) {
  return (
    <div className="flex flex-col gap-y-2">
      <Input.Label className="text-text-secondary" htmlFor={inputName}>
        {label}
      </Input.Label>
      <div className="flex flex-col gap-y-1">
        <CompactInput name={inputName} {...inputProps} />
        <p className="text-2xs text-text-tertiary text-left">{helpText}</p>
      </div>
    </div>
  );
}
