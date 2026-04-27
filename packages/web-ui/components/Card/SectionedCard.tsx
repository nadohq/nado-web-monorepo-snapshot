import { mergeClassNames } from '@nadohq/web-common';
import { ComponentPropsWithRef } from 'react';
import { Card, CARD_PADDING_CLASSNAMES } from './Card';

/**
 * A card with header and content sections.
 *
 * Usage (with header):
 * <SectionedCard>
 *   <SectionedCard.Header>Header Content</SectionedCard.Header>
 *   <SectionedCard.Content>Content</SectionedCard.Content>
 * </SectionedCard>
 */
export function SectionedCard({
  className,
  ...divProps
}: ComponentPropsWithRef<'div'>) {
  return (
    <Card
      className={mergeClassNames(
        // header->content flows vertically
        'flex flex-col',
        // padding is handled by Header and Content subcomponents
        'p-0',
        className,
      )}
      {...divProps}
    />
  );
}

SectionedCard.Header = function CardHeader({
  className,
  ...divProps
}: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={mergeClassNames(
        CARD_PADDING_CLASSNAMES.box,
        'border-overlay-divider border-b',
        'text-text-primary text-sm',
        className,
      )}
      {...divProps}
    />
  );
};

SectionedCard.Content = function CardContent({
  className,
  ...divProps
}: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={mergeClassNames(
        'flex-1',
        CARD_PADDING_CLASSNAMES.box,
        className,
      )}
      {...divProps}
    />
  );
};
