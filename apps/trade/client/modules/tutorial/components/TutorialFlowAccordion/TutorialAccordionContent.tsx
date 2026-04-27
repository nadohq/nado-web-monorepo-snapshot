import { Button, PrimaryButton } from '@nadohq/web-ui';
import * as Accordion from '@radix-ui/react-accordion';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  description: ReactNode;
  actionLabel: string;
  onActionClick: () => void;
  onSkipClick: () => void;
}

export function TutorialAccordionContent({
  description,
  actionLabel,
  onActionClick,
  onSkipClick,
}: Props) {
  const { t } = useTranslation();

  return (
    <Accordion.Content
      // Left padding to align the description with the label
      className="flex flex-col gap-y-3 pl-8"
    >
      <div className="text-text-tertiary text-xs">{description}</div>
      <div className="flex gap-x-2">
        <PrimaryButton onClick={onActionClick} size="sm">
          {actionLabel}
        </PrimaryButton>
        <Button
          className="text-text-secondary hover:text-text-primary text-xs"
          onClick={onSkipClick}
        >
          {t(($) => $.buttons.skip)}
        </Button>
      </div>
    </Accordion.Content>
  );
}
