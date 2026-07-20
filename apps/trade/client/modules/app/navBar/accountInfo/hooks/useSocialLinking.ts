import { asyncResult } from '@nadohq/client';
import { useExecuteConnectSocialAccount } from 'client/hooks/execute/useExecuteConnectSocialAccount';
import { useExecuteRevokeSocialAccount } from 'client/hooks/execute/useExecuteRevokeSocialAccount';
import { useQueryLinkedSocialAccounts } from 'client/hooks/query/social/useQueryLinkedSocialAccounts';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useTranslation } from 'react-i18next';

export function useSocialLinking() {
  const { t } = useTranslation();
  const { data: linkedAccounts } = useQueryLinkedSocialAccounts();
  const { dispatchNotification } = useNotificationManagerContext();
  const executeConnectSocialAccount = useExecuteConnectSocialAccount();
  const executeRevokeSocialAccount = useExecuteRevokeSocialAccount();

  const twitterAccount = linkedAccounts?.accounts.find(
    (account) => account.provider === 'twitter',
  );

  const connect = async () => {
    const serverExecutionResult = executeConnectSocialAccount.mutateAsync({
      provider: 'twitter',
    });

    dispatchNotification({
      type: 'action_error_handler',
      data: {
        errorNotificationTitle: t(($) => $.errors.connectSocialAccountFailed),
        executionData: { serverExecutionResult },
      },
    });

    const [res] = await asyncResult(serverExecutionResult);

    if (!res?.url) return;

    if (typeof window !== 'undefined') {
      window.open(res.url, '_blank', 'noopener,noreferrer');
    }
  };

  const revoke = () => {
    const serverExecutionResult = executeRevokeSocialAccount.mutateAsync({
      provider: 'twitter',
    });

    dispatchNotification({
      type: 'action_error_handler',
      data: {
        errorNotificationTitle: t(($) => $.errors.revokeSocialAccountFailed),
        executionData: { serverExecutionResult },
      },
    });
  };

  return {
    twitterAccount,
    connect,
    revoke,
    isConnecting: executeConnectSocialAccount.isPending,
    isRevoking: executeRevokeSocialAccount.isPending,
  };
}
