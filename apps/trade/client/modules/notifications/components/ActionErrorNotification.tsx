import { ActionToast } from 'client/components/Toast/ActionToast/ActionToast';
import { ErrorToastContent } from 'client/components/Toast/ActionToast/ErrorToastContent';
import { Toast } from 'client/components/Toast/Toast';
import { ToastProps } from 'client/components/Toast/types';
import { ParsedExecuteError } from 'client/utils/errors/parseExecuteError';

interface ActionErrorNotificationProps extends ToastProps {
  title: string;
  error: ParsedExecuteError;
}

export function ActionErrorNotification({
  title,
  error,
  ttl,
  onDismiss,
}: ActionErrorNotificationProps) {
  return (
    <ActionToast.Container>
      <ActionToast.TextHeader variant="failure" onDismiss={onDismiss}>
        {title}
      </ActionToast.TextHeader>
      <ActionToast.Separator variant="failure" ttl={ttl} />
      <Toast.Body>
        <ErrorToastContent error={error} />
      </Toast.Body>
    </ActionToast.Container>
  );
}
