import { useCopyText, WithClassnames } from '@nadohq/web-common';
import {
  CompactInput,
  CopyIcon,
  IconButton,
  Icons,
  Input,
  SecondaryButton,
} from '@nadohq/web-ui';
import { useToggle } from 'ahooks';
import {
  SignatureModeSlowModeSettingsFormErrorType,
  SignatureModeSlowModeSettingsFormValues,
} from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/hooks/types';
import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  form: UseFormReturn<SignatureModeSlowModeSettingsFormValues>;
  setRandomPrivateKey: () => void;
  validatePrivateKey: (
    input: string,
  ) => SignatureModeSlowModeSettingsFormErrorType | undefined;
  // Disables the input and all associated actions
  disabled: boolean;
  error: ReactNode;
}

export function PrivateKeyInput({
  error,
  form,
  setRandomPrivateKey,
  validatePrivateKey,
  disabled,
}: Props) {
  const { t } = useTranslation();

  // Copy button
  const { isCopied, copy } = useCopyText();
  const onCopyClick = () => {
    copy(form.getValues('privateKey'));
  };

  // Show/Hide button
  const [isPrivateKeyHidden, { toggle: toggleIsPrivateKeyHidden }] =
    useToggle(true);

  const ShowHideIcon = isPrivateKeyHidden ? Icons.EyeSlash : Icons.Eye;
  const hideIconMessage = isPrivateKeyHidden
    ? t(($) => $.buttons.showPrivateKey)
    : t(($) => $.buttons.hidePrivateKey);

  const register = form.register('privateKey', {
    validate: validatePrivateKey,
  });

  return (
    <div className="flex flex-col gap-y-2">
      {/*Label*/}
      <div className="flex items-center justify-between">
        <Input.Label htmlFor={register.name} className="text-text-primary">
          {t(($) => $.oneClickTradingPrivateKey)}
        </Input.Label>
        <SecondaryButton
          size="xs"
          onClick={setRandomPrivateKey}
          startIcon={<Icons.ArrowClockwise />}
          disabled={disabled}
        >
          {t(($) => $.buttons.generate)}
        </SecondaryButton>
      </div>
      {/*Input*/}
      <div className="flex gap-x-1">
        <CompactInput
          {...register}
          className="flex-1"
          id={register.name}
          placeholder="0x..."
          type={isPrivateKeyHidden ? 'password' : 'text'}
          errorTooltipContent={error}
          disabled={disabled}
        />
        <IconButton
          tooltipLabel={hideIconMessage}
          size="sm"
          icon={ShowHideIcon}
          onClick={toggleIsPrivateKeyHidden}
          disabled={disabled}
        />
        <IconButton
          tooltipLabel={
            isCopied
              ? t(($) => $.buttons.privateKeyCopied)
              : t(($) => $.buttons.copyPrivateKey)
          }
          size="sm"
          icon={(props) => <CopyIcon {...props} isCopied={isCopied} />}
          onClick={onCopyClick}
          disabled={disabled}
        />
      </div>
      <p className="text-text-tertiary text-xs">
        {t(($) => $.useSameKeyToSetUpOneClickTradingOnOtherDevices)}
      </p>
    </div>
  );
}
