import { joinClassNames, mergeClassNames } from '@nadohq/web-common';
import { getStateOverlayClassNames } from '../../../utils';
import { CARD_ROUNDED_CLASSNAMES } from '../../Card';
import { Icons } from '../../Icons';
import { Button } from '../Button';
import { NavCardButtonContent } from './NavCardButtonContent';
import { NavCardBaseProps } from './types';

export type NavCardButtonProps = NavCardBaseProps & {
  active?: boolean;
  stateClassNameOverrides?: string;
  titleClassName?: string;
  iconClassName?: string;
};

export function NavCardButton({
  title,
  titleClassName,
  description,
  icon,
  iconClassName,
  active,
  className,
  contentClassName,
  stateClassNameOverrides,
  ...rest
}: NavCardButtonProps) {
  const stateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant: 'lg',
    disabled: rest.disabled,
    active,
    stateClassNameOverrides,
  });

  return (
    <Button
      className={mergeClassNames(
        'relative px-2 py-1.5',
        CARD_ROUNDED_CLASSNAMES,
        stateOverlayClassNames,
        className,
      )}
      endIcon={<Icons.CaretRight className="text-text-tertiary" />}
      {...rest}
    >
      <NavCardButtonContent
        icon={icon}
        iconClassName={iconClassName}
        title={title}
        titleClassName={titleClassName}
        description={description}
        className={joinClassNames('flex-1', contentClassName)}
      />
    </Button>
  );
}
