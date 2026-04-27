import { WithChildren } from '@nadohq/web-common';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';
import { AdvancedOrderRequireActiveOneClickTradingInfo } from 'client/modules/trading/components/AdvancedOrderRequireActiveOneClickTradingInfo';

export function TriggerOrderPlaceholderContent({ children }: WithChildren) {
  const isConnected = useIsConnected();
  const isSingleSignatureSession = useIsSingleSignatureSession({
    requireActive: true,
  });

  const showCta = isConnected && !isSingleSignatureSession;

  return (
    <div className="flex flex-col items-start gap-y-2">
      <p>{children}</p>
      {showCta && <AdvancedOrderRequireActiveOneClickTradingInfo />}
    </div>
  );
}
