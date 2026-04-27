import {
  joinClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { Button, ButtonAsLinkProps, IconComponent } from '@nadohq/web-ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { ReactNode } from 'react';

interface CollapsibleProps extends WithClassnames {
  triggerContent: ReactNode;
  collapsibleContent: ReactNode;
}

function Collapsible({
  triggerContent,
  collapsibleContent,
  className,
}: CollapsibleProps) {
  return (
    <NavigationMenu.Item className={className}>
      {/*w-full here allows the collapsible to take up the full width of the collapsible root*/}
      <NavigationMenu.Trigger asChild className="w-full">
        {triggerContent}
      </NavigationMenu.Trigger>
      <NavigationMenu.Content className="pt-2 pl-6">
        {collapsibleContent}
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}

function CollapsibleLinksContainer({
  children,
  className,
}: WithChildren<WithClassnames>) {
  return (
    <div
      className={joinClassNames(
        'border-overlay-divider flex flex-col gap-y-2 border-l px-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CollapsibleLinkButtonProps extends Omit<ButtonAsLinkProps, 'as'> {
  icon?: IconComponent;
  active?: boolean;
}

function CollapsibleLinkButton({
  active,
  icon: Icon,
  children,
  className,
  ...rest
}: CollapsibleLinkButtonProps) {
  return (
    <NavigationMenu.Link asChild>
      <Button
        as={Link}
        className={joinClassNames(
          active
            ? 'text-text-primary'
            : 'hover:text-text-primary text-text-secondary',
          'flex items-center justify-start gap-x-1 font-medium',
          'p-2',
          className,
        )}
        startIcon={
          Icon ? <Icon className="text-text-primary" size={24} /> : undefined
        }
        {...rest}
      >
        {children}
      </Button>
    </NavigationMenu.Link>
  );
}

export const MobileNavCustomCollapsible = {
  Root: Collapsible,
  LinksContainer: CollapsibleLinksContainer,
  LinkButton: CollapsibleLinkButton,
};
