import { useTranslation } from 'react-i18next';

interface Props {
  stepNumber: number;
  heading: string;
  description?: string;
}

export function AddSubaccountDialogStepHeader({
  stepNumber,
  heading,
  description,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-y-1 text-xs">
      <p className="text-text-secondary">
        {t(($) => $.stepNumber, { stepNumber })}
      </p>
      <p className="text-text-primary text-base">{heading}</p>
      {description && <p className="text-text-tertiary">{description}</p>}
    </div>
  );
}
