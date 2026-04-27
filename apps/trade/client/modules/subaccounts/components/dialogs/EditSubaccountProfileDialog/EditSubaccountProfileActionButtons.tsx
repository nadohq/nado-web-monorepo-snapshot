import { WithClassnames } from '@nadohq/web-common';
import { Button, PrimaryButton } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

interface Props {
  resetChanges: () => void;
  isFormDirty: boolean;
}

export function EditSubaccountProfileActionButtons({
  resetChanges,
  isFormDirty,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  return (
    <>
      <PrimaryButton type="submit" disabled={!isFormDirty}>
        {t(($) => $.buttons.save)}
      </PrimaryButton>
      {isFormDirty && (
        <Button
          className="text-text-secondary hover:text-text-primary py-1.5 text-sm"
          onClick={resetChanges}
        >
          {t(($) => $.buttons.resetChanges)}
        </Button>
      )}
    </>
  );
}
