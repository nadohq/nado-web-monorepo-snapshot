import { SecondaryButton } from '@nadohq/web-ui';
import { CheckmarkIcon } from 'client/components/CheckmarkIcon';
import { useTranslation } from 'react-i18next';

export function TutorialFlowSuccessContent({
  onClose,
}: {
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-y-2 rounded-lg py-4">
      <CheckmarkIcon size={90} />
      <div className="flex flex-col gap-y-5 px-4">
        <div className="flex flex-col gap-y-1 text-center">
          <p className="text-text-primary text-xl">{t(($) => $.allSetUp)}</p>
          <p className="text-text-tertiary text-sm leading-6">
            {t(($) => $.enjoyExperience)}
          </p>
        </div>
        <SecondaryButton onClick={onClose}>
          {t(($) => $.buttons.close)}
        </SecondaryButton>
      </div>
    </div>
  );
}
