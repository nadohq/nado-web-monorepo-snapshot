import { joinClassNames } from '@nadohq/web-common';
import {
  ACTION_TOAST_ICON_FILL_BY_VARIANT,
  ACTION_TOAST_ICONS_BY_VARIANT,
} from 'client/components/Toast/ActionToast/consts';
import {
  ActionToastBodyProps,
  ActionToastHeaderProps,
  ActionToastSeparatorProps,
} from 'client/components/Toast/ActionToast/types';
import { TOAST_HEADER_ICON_SIZE } from 'client/components/Toast/consts';
import { Toast } from 'client/components/Toast/Toast';

function TextHeader({
  className,
  children,
  variant,
  icon,
  onDismiss,
}: ActionToastHeaderProps) {
  const Icon = icon ?? ACTION_TOAST_ICONS_BY_VARIANT[variant];

  return (
    <Toast.Header
      onDismiss={onDismiss}
      className={joinClassNames('flex items-center gap-x-2', className)}
    >
      <Icon
        fill={ACTION_TOAST_ICON_FILL_BY_VARIANT[variant]}
        size={TOAST_HEADER_ICON_SIZE}
      />
      {children}
    </Toast.Header>
  );
}

function Separator({ variant, ttl }: ActionToastSeparatorProps) {
  const dividerColor = {
    success: 'bg-positive/50',
    failure: 'bg-negative/50',
    pending: 'bg-accent/50',
  }[variant];

  return (
    <Toast.Separator
      className={joinClassNames(
        variant === 'pending' && 'animate-pulse',
        dividerColor,
      )}
      ttl={ttl}
    />
  );
}

function Body({ className, children }: ActionToastBodyProps) {
  // toast body can be multi-line, so we use leading-normal
  return (
    <Toast.Body className={joinClassNames('leading-normal', className)}>
      {children}
    </Toast.Body>
  );
}

export const ActionToast = {
  Container: Toast.Container,
  TextHeader,
  Separator,
  Body,
};
