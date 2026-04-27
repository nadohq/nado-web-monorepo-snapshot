import { joinClassNames, mergeClassNames } from '@nadohq/web-common';
import { Icons } from '../../Icons';
import { CardButton } from './CardButton';
import { NavCardButtonContent } from './NavCardButtonContent';
import { NavCardBaseProps } from './types';

export function ExternalNavCardButton({
  title,
  description,
  icon,
  className,
  contentClassName,
  ...rest
}: NavCardBaseProps) {
  return (
    <CardButton
      className={mergeClassNames('bg-surface-2 px-3', className)}
      endIcon={<Icons.ArrowUpRight size={20} className="text-text-tertiary" />}
      {...rest}
    >
      <NavCardButtonContent
        icon={icon}
        className={joinClassNames('flex-1 gap-y-2', contentClassName)}
        title={title}
        description={description}
        titleClassName="text-base"
        descriptionClassName="text-xs"
        iconClassName="h-4"
      />
    </CardButton>
  );
}
