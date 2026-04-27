import { TextButton } from '@nadohq/web-ui/components/Button/TextButton';
import { useRepeatedClickCountHandler } from 'client/hooks/ui/useRepeatedClickCountHandler';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useRequiresApproveSignOnce } from 'client/modules/singleSignatureSessions/hooks/useRequiresApproveSignOnce';
import { enableDebugTriggerQueriesAtom } from 'client/store/trading/commonTradingStore';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export function AdvancedOrderRequireActiveOneClickTradingInfo() {
  const { t } = useTranslation();

  const [, setEnableDebugTriggerQueries] = useAtom(
    enableDebugTriggerQueriesAtom,
  );
  const onKeywordClick = useRepeatedClickCountHandler({
    handler: (count) => {
      if (count === 3) {
        setEnableDebugTriggerQueries(true);
      }
    },
  });

  const { show } = useDialog();

  const requiresApproveSignOnce = useRequiresApproveSignOnce();

  return (
    <div className="flex flex-col items-start gap-y-2">
      <p onClick={onKeywordClick}>
        {t(($) => $.oneClickTradingRequiredForAdvancedOrders)}
      </p>
      <TextButton
        colorVariant="secondary"
        onClick={() => {
          show({
            type: requiresApproveSignOnce
              ? 'single_signature_reapproval'
              : 'signature_mode_settings',
            params: {},
          });
        }}
        className="w-max underline"
      >
        {requiresApproveSignOnce
          ? t(($) => $.buttons.approveOneClickTrading)
          : t(($) => $.buttons.enableOneClickTrading)}
      </TextButton>
    </div>
  );
}
