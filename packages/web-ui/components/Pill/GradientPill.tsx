import {
  joinClassNames,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { IconComponent } from '../Icons';
import { PillColorVariant } from './Pill';

export type GradientPillColorVariant = Exclude<
  PillColorVariant,
  'primary' | 'secondary'
>;

interface Props extends WithChildren<WithClassnames> {
  colorVariant: GradientPillColorVariant;
  icon?: IconComponent;
}

export function GradientPill({
  children,
  className,
  colorVariant,
  icon: Icon,
}: Props) {
  const gradientBorderStopColorClassName = {
    positive: 'to-positive',
    negative: 'to-negative',
    warning: 'to-warning',
    'accent-info': 'to-accent-info',
    'accent-yellow': 'to-accent-yellow',
  }[colorVariant];

  const textColorClassName = {
    positive: 'text-positive',
    negative: 'text-negative',
    warning: 'text-warning',
    'accent-info': 'text-accent-info',
    'accent-yellow': 'text-accent-yellow',
  }[colorVariant];

  return (
    <div
      className={joinClassNames(
        'rounded-sm p-px',
        'from-overlay-divider bg-linear-to-r',
        gradientBorderStopColorClassName,
        className,
      )}
    >
      <div
        className={mergeClassNames(
          'text-2xs rounded-sm p-0.75',
          'h-max',
          'bg-surface-1 flex items-center gap-x-0.5',
          // Using less padding on the left when an icon is present to make the icon and text look more centered
          !!Icon && 'pl-0.5',
          textColorClassName,
        )}
      >
        {!!Icon && <Icon fill="currentColor" />}
        {children}
      </div>
    </div>
  );
}
