import { mergeClassNames } from '@nadohq/web-common';
import { StatusIndicator } from '../../StatusIndicator';
import { NavCardBaseProps } from './types';

interface Props extends Pick<
  NavCardBaseProps,
  'className' | 'description' | 'title' | 'icon'
> {
  descriptionClassName?: string;
  titleClassName?: string;
  iconClassName?: string;
  showLiveIndicator?: boolean;
}

export function NavCardButtonContent({
  icon: Icon,
  title,
  description,
  titleClassName,
  descriptionClassName,
  iconClassName,
  showLiveIndicator,
  className,
}: Props) {
  return (
    <div className={mergeClassNames('flex flex-col text-left', className)}>
      <div
        className={mergeClassNames(
          'flex items-center gap-x-1.5 text-sm',
          titleClassName,
        )}
      >
        {Icon && (
          <Icon className={mergeClassNames('h-4 w-auto', iconClassName)} />
        )}
        {title}
        {showLiveIndicator && (
          <StatusIndicator sizeVariant="sm" colorVariant="positive" pulse />
        )}
      </div>
      {description && (
        <div
          className={mergeClassNames(
            'text-text-tertiary text-2xs leading-snug whitespace-normal',
            descriptionClassName,
          )}
        >
          {description}
        </div>
      )}
    </div>
  );
}
