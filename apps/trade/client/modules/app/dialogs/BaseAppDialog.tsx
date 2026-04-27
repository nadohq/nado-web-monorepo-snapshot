import { joinClassNames } from '@nadohq/web-common';
import {
  BaseDialog,
  BaseDialogProps,
  BaseDialogTitleProps,
  Icons,
  SecondaryButton,
  TextButton,
} from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface DialogContainerProps extends Omit<
  BaseDialogProps,
  'open' | 'onOpenChange'
> {
  onClose?: () => void;
}

/**
 * Our app dialog only mounts dialogs when they're supposed to be shown, so this is a thin wrapper over BaseDialog
 * that abstracts away the open state
 */
function DialogContainer({ children, onClose, ...rest }: DialogContainerProps) {
  const onOpenChange = (open: boolean) => {
    if (!open) {
      onClose?.();
    }
  };

  return (
    <BaseDialog.Container open onOpenChange={onOpenChange} {...rest}>
      {children}
    </BaseDialog.Container>
  );
}

interface DialogTitleProps extends BaseDialogTitleProps {
  endElement?: ReactNode;
  onClose?: () => void;
}

function DialogTitle({
  children,
  onClose,
  endElement,
  className,
  ...rest
}: DialogTitleProps) {
  const { canGoBack, goBack } = useDialog();
  const { t } = useTranslation();

  const backButton = canGoBack ? (
    <SecondaryButton
      size="base"
      startIcon={<Icons.CaretLeft size={14} />}
      onClick={goBack}
      className="gap-x-1 py-1.5 pr-2 pl-1"
    >
      {t(($) => $.buttons.back)}
    </SecondaryButton>
  ) : null;

  return (
    <BaseDialog.Title
      className={joinClassNames('flex items-center gap-x-4', className)}
      {...rest}
    >
      <div className="flex flex-1 items-center gap-x-2 lg:gap-x-3">
        {backButton}
        {children}
      </div>
      {endElement}
      {onClose && (
        <TextButton
          // Position adjustment to counter balances the right padding
          className="relative left-1.5 p-1.5"
          colorVariant="secondary"
          startIcon={<Icons.X />}
          onClick={onClose}
          dataTestId="close-dialog-button"
        />
      )}
    </BaseDialog.Title>
  );
}

export const BaseAppDialog = {
  Container: DialogContainer,
  Title: DialogTitle,
  Body: BaseDialog.Body,
  Footer: BaseDialog.Footer,
};
