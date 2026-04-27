import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { LabelTooltip, TextButton } from '@nadohq/web-ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { MoreIconLink } from 'client/modules/app/navBar/moreLinks/useMoreLinks';
import Link from 'next/link';

export function MoreIconLinks({
  moreIconLinks,
  className,
}: WithClassnames<{
  moreIconLinks: MoreIconLink[];
}>) {
  return (
    <div className={mergeClassNames('flex gap-x-2 px-2 py-1.5', className)}>
      {moreIconLinks.map(({ label, href, icon: Icon, external }) => (
        <NavigationMenu.Link key={label} asChild>
          <LabelTooltip noHelpCursor label={label} asChild>
            <TextButton
              colorVariant="secondary"
              as={Link}
              href={href}
              external={external}
              startIcon={<Icon className="h-5 w-auto" />}
            />
          </LabelTooltip>
        </NavigationMenu.Link>
      ))}
    </div>
  );
}
