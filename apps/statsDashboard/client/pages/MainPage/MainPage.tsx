import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Divider, LinkButton, PrimaryButton } from '@nadohq/web-ui';

import nadoLogo from 'client/assets/nado-logo.svg';
import { LINKS } from 'client/config/links';
import { DashboardTabs } from 'client/pages/MainPage/components/DashboardTabs';
import Image from 'next/image';
import Link from 'next/link';

export function MainPage() {
  return (
    <>
      <PageHeader />
      <DashboardTabs />
    </>
  );
}

function PageHeader() {
  return (
    <div className="flex flex-col gap-y-3 sm:gap-y-5">
      <Divider />
      <div className="flex flex-col items-start gap-y-6 sm:flex-row sm:items-center">
        <Image src={nadoLogo} alt="Nado" className="h-6 w-auto lg:h-14" />
        <HeaderActions className="sm:ml-auto" />
      </div>
    </div>
  );
}

function HeaderActions({ className }: WithClassnames) {
  return (
    <div
      className={joinClassNames(
        'flex flex-col gap-y-2 sm:items-end',
        className,
      )}
    >
      <PrimaryButton as={Link} href={LINKS.nadoApp}>
        Launch Nado
      </PrimaryButton>
      <div className="text-sm font-medium">
        API Gateway:{' '}
        <LinkButton
          colorVariant="secondary"
          as={Link}
          href={LINKS.apiDocs}
          external
        >
          Go to Docs
        </LinkButton>
      </div>
    </div>
  );
}
