'use client';

import { joinClassNames } from '@nadohq/web-common';
import {
  CARD_PADDING_CLASSNAMES,
  Divider,
  ScrollShadowsContainer,
  TabTextButton,
} from '@nadohq/web-ui';
import { usePortfolioNavItems } from 'client/pages/Portfolio/hooks/usePortfolioNavItems';
import Link from 'next/link';
import { Fragment } from 'react';

export function PortfolioNavigationLinks() {
  const navItems = usePortfolioNavItems();

  return (
    <ScrollShadowsContainer
      className={joinClassNames(
        'flex gap-x-3 py-1',
        CARD_PADDING_CLASSNAMES.horizontal,
      )}
      orientation="horizontal"
    >
      {navItems.map(({ selected, href, label }) => (
        <Fragment key={label}>
          <TabTextButton
            className="text-base lg:text-xl"
            as={Link}
            href={href}
            active={selected}
          >
            {label}
          </TabTextButton>
          <Divider vertical className="last:hidden" />
        </Fragment>
      ))}
    </ScrollShadowsContainer>
  );
}
