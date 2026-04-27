import { mergeClassNames } from '@nadohq/web-common';
import { DistributedOmit } from 'type-fest';
import { getStateOverlayClassNames } from '../../../utils';
import { CARD_CLASSNAMES } from '../../Card';
import { Button } from '../Button';
import {
  STANDARD_BUTTON_HORIZONTAL_PADDING_CLASSNAME,
  STANDARD_BUTTON_TEXT_SIZE_CLASSNAME,
  STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME,
} from '../consts';
import { ButtonProps } from '../types';

export type CardButtonBaseProps = DistributedOmit<ButtonProps, 'isLoading'>;

export function CardButton({
  className,
  disabled,
  ...rest
}: CardButtonBaseProps) {
  const stateOverlayClassNames = getStateOverlayClassNames({
    disabled,
    borderRadiusVariant: 'sm',
  });

  return (
    <Button
      className={mergeClassNames(
        'text-text-primary flex items-center gap-3',
        STANDARD_BUTTON_HORIZONTAL_PADDING_CLASSNAME.base,
        STANDARD_BUTTON_TEXT_SIZE_CLASSNAME.base,
        STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME.base,
        CARD_CLASSNAMES,
        // This needs to be after `CARD_CLASSNAMES` to override the border-radius
        'rounded-sm',
        stateOverlayClassNames,
        className,
      )}
      disabled={disabled}
      {...rest}
    />
  );
}
