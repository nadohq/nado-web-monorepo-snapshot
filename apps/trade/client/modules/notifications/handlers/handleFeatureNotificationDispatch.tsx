import { FeatureNotificationDisclosureKey } from 'client/modules/localstorage/userState/types/userDisclosureTypes';
import { PerpMarketsFeatureNotification } from 'client/modules/notifications/components/newFeature/features/PerpMarketsFeatureNotification';
import { toast } from 'sonner';

export async function handleFeatureNotificationDispatch(
  feature: FeatureNotificationDisclosureKey,
) {
  switch (feature) {
    case 'new_mkts_apr_23_2026':
      return toast.custom(
        (t) => (
          <PerpMarketsFeatureNotification
            onDismiss={() => {
              toast.dismiss(t);
            }}
            ttl={Infinity}
            disclosureKey={feature}
            productIds={[64, 76]}
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
