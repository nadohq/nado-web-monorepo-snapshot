import { joinClassNames } from '@nadohq/web-common';
import { Divider, Icons } from '@nadohq/web-ui';
import { Kbd } from 'client/modules/commandCenter/components/Kbd';
import { IMAGES } from 'common/brandMetadata/images';
import Image from 'next/image';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <div
      className={joinClassNames(
        'hidden items-center justify-between rounded-b-xl px-6 py-4 lg:flex',
        'bg-surface-card text-xs',
      )}
    >
      <div className="flex items-center gap-x-6">
        <Section>
          {t(($) => $.commandCenterInstructions.navigate)}
          <div className="flex gap-x-1">
            <Kbd icon={Icons.ArrowUp} />
            <Kbd icon={Icons.ArrowDown} />
          </div>
        </Section>
        <Divider vertical />
        <Section>
          {t(($) => $.commandCenterInstructions.select)}
          <Kbd text={t(($) => $.commandCenterInstructions.enter)} />
        </Section>
        <Divider vertical />
        <Section>
          {t(($) => $.commandCenterInstructions.close)}
          <Kbd text={t(($) => $.commandCenterInstructions.esc)} />
        </Section>
      </div>
      <Image src={IMAGES.brandIcon} className="h-6 w-auto" alt="" />
    </div>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-x-2">{children}</div>;
}
