import {
  joinClassNames,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { IconComponent } from '../Icons';
import { PillColorVariant, PillSizeVariant } from './Pill';

interface Props extends WithChildren<WithClassnames> {
  colorVariant: Exclude<PillColorVariant, 'primary' | 'secondary'>;
  sizeVariant: PillSizeVariant;
  icon?: IconComponent;
}

export function GradientPill({
  children,
  className,
  colorVariant,
  sizeVariant,
  icon: Icon,
}: Props) {
  const gradientBorderStopColorClassName = {
    positive: 'to-positive',
    negative: 'to-negative',
    warning: 'to-warning',
    'accent-info': 'to-accent-info',
  }[colorVariant];

  const textColorClassName = {
    positive: 'text-positive',
    negative: 'text-negative',
    warning: 'text-warning',
    'accent-info': 'text-accent-info',
  }[colorVariant];

  const sizeClassNames = {
    '2xs': 'px-1.5 py-px',
    xs: 'px-2 py-0.5',
  }[sizeVariant];

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
          'text-3xs h-max',
          'bg-surface-1 flex items-center gap-x-0.5 rounded-[3px]',
          // Using `2px` less padding on the left when an icon is preset to make the icon and text look more centered
          !!Icon && 'pl-1.5',
          textColorClassName,
          sizeClassNames,
        )}
      >
        {!!Icon && <Icon fill="currentColor" />}
        {children}
      </div>
    </div>
  );
}
