import { ProductEngineType } from '@nadohq/client';
import { FeatureNotificationDisclosureKey } from 'client/modules/localstorage/userState/types/userDisclosureTypes';
import { NewMarketsFeatureNotification } from 'client/modules/notifications/components/newFeature/features/NewMarketsFeatureNotification';
import { toast } from 'sonner';

export async function handleFeatureNotificationDispatch(
  feature: FeatureNotificationDisclosureKey,
) {
  switch (feature) {
    case 'new_mkts_jul_09_2026':
      return toast.custom(
        (t) => (
          <NewMarketsFeatureNotification
            onDismiss={() => {
              toast.dismiss(t);
            }}
            ttl={Infinity}
            disclosureKey={feature}
            marketType={ProductEngineType.PERP}
            productIds={[158]}
          />
        ),
        {
          duration: Infinity,
          id: feature,
        },
      );
    default:
      break;
  }
}
