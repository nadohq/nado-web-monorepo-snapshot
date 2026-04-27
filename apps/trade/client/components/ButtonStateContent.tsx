import { Icons } from '@nadohq/web-ui';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';
import { useTranslation } from 'react-i18next';

function SuccessButtonContent({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-x-1">
      <Icons.Check />
      <span>{message}</span>
    </div>
  );
}

function LoadingButtonContent({
  singleSignatureMessage,
}: {
  singleSignatureMessage: string;
}) {
  const { t } = useTranslation();
  const isSingleSignatureSession = useIsSingleSignatureSession({
    requireActive: true,
  });

  return (
    <>
      {isSingleSignatureSession
        ? singleSignatureMessage
        : t(($) => $.buttons.confirmTransaction)}
    </>
  );
}

export const ButtonStateContent = {
  Success: SuccessButtonContent,
  Loading: LoadingButtonContent,
};
