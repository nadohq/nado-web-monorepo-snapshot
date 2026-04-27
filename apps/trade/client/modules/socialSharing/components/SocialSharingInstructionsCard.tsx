import { joinClassNames } from '@nadohq/web-common';
import { Card, DiscList } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

export function SocialSharingInstructionsCard() {
  const { t } = useTranslation();

  return (
    <Card
      className={joinClassNames(
        'text-text-secondary bg-overlay-accent text-xs',
        'flex flex-col gap-y-2',
      )}
    >
      <div className="text-text-primary font-medium">
        {t(($) => $.shareOnX)}
      </div>
      <DiscList.Container>
        <DiscList.Item>{t(($) => $.sharingFlow.step1)}</DiscList.Item>
        <DiscList.Item>{t(($) => $.sharingFlow.step2)}</DiscList.Item>
        <DiscList.Item>{t(($) => $.sharingFlow.step3)}</DiscList.Item>
      </DiscList.Container>
    </Card>
  );
}
