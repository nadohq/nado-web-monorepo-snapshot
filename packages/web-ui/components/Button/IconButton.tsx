import { mergeClassNames } from '@nadohq/web-common';
import { DistributedOmit } from 'type-fest';
import { BorderRadiusVariant, SizeVariant } from '../../types';
import { getStateOverlayClassNames } from '../../utils';
import { IconComponent } from '../Icons/types';
import { LabelTooltip } from '../Tooltip';
import { Button } from './Button';
import { ButtonProps } from './types';

type Props = DistributedOmit<ButtonProps, 'loadingIconSize'> & {
  icon: IconComponent;
  iconClassName?: string;
  size: SizeVariant;
  tooltipLabel?: string;
  borderRadiusVariant?: BorderRadiusVariant;
};

export function IconButton({
  icon: Icon,
  className,
  iconClassName,
  size,
  tooltipLabel,
  borderRadiusVariant = 'sm',
  ...rest
}: Props) {
  const stateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant,
    disabled: rest.disabled,
    isLoading: rest.isLoading,
  });

  const { paddingClassNames, iconSize } = {
    xs: {
      paddingClassNames: 'p-1.5',
      iconSize: 12,
    },
    sm: {
      paddingClassNames: 'p-2',
      iconSize: 16,
    },
    base: {
      paddingClassNames: 'p-2.5',
      iconSize: 20,
    },
    lg: {
      paddingClassNames: 'p-3',
      iconSize: 24,
    },
    xl: {
      paddingClassNames: 'p-3',
      iconSize: 24,
    },
  }[size];

  const stateClassNames = (() => {
    if (rest.isLoading || rest.disabled) {
      return 'bg-surface-3';
    }
    return 'bg-surface-2';
  })();

  const button = (
    <Button
      className={mergeClassNames(
        'text-text-primary aspect-square rounded-sm',
        stateClassNames,
        stateOverlayClassNames,
        paddingClassNames,
        className,
      )}
      loadingIconSize={iconSize}
      {...rest}
    >
      <Icon size={iconSize} className={iconClassName} />
    </Button>
  );

  if (!tooltipLabel) {
    return button;
  }

  return (
    <LabelTooltip label={tooltipLabel} asChild noHelpCursor>
      {button}
    </LabelTooltip>
  );
}
