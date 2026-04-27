import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { PointsTierShareDialog } from 'client/modules/points/components/PointsTierShareDialog';

export function PointsDialogs() {
  const { currentDialog } = useDialog();

  return (
    <>
      {currentDialog?.type === 'points_tier_share' && (
        <PointsTierShareDialog {...currentDialog.params} />
      )}
    </>
  );
}
