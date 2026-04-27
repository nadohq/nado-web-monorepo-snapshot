import {
  BaseTestProps,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { SizeVariant } from '../../types';

export type PillSizeVariant = '2xs' | Extract<SizeVariant, 'xs'>;

export type PillColorVariant =
  | 'positive'
  | 'primary'
  | 'secondary'
  | 'negative'
  | 'accent-info'
  | 'warning';

export interface PillProps extends WithChildren<WithClassnames>, BaseTestProps {
  colorVariant: PillColorVariant;
  sizeVariant: PillSizeVariant;
}

export function Pill({
  colorVariant,
  sizeVariant,
  children,
  className,
  dataTestId,
}: PillProps) {
  const colorClassNames = {
    positive: 'text-positive bg-positive-muted',
    warning: 'text-warning bg-warning-muted',
    'accent-info': 'text-accent-info bg-overlay-accent',
    negative: 'text-negative bg-negative-muted',
    primary: 'text-text-primary bg-surface-2',
    secondary: 'text-text-secondary bg-surface-3',
  }[colorVariant];

  // -my- to cancel layout shift due to py padding so that pill
  // stays inline within line height
  const sizeClassNames = {
    '2xs': 'text-2xs rounded-xs px-1 py-0.5 -my-0.5',
    xs: 'text-xs rounded-sm px-2 py-1 -my-1',
  }[sizeVariant];

  return (
    <div
      data-testid={dataTestId}
      className={mergeClassNames(
        'inline-block gap-1 align-middle',
        'font-medium whitespace-nowrap',
        colorClassNames,
        sizeClassNames,
        className,
      )}
    >
      {children}
    </div>
  );
}
