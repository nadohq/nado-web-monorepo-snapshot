import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Button, ButtonProps } from '@nadohq/web-ui';
import { FavoriteIcon } from 'client/components/Icons/FavoriteIcon';

type FavoriteButtonProps = ButtonProps & {
  size: number;
  isFavorited: boolean;
};

export function FavoriteButton({
  className,
  size,
  disabled,
  isFavorited,
  ...rest
}: WithClassnames<FavoriteButtonProps>) {
  return (
    <Button
      className={joinClassNames('p-3', className)}
      disabled={disabled}
      {...rest}
    >
      <FavoriteIcon isFavorited={isFavorited} disabled={disabled} size={size} />
    </Button>
  );
}
