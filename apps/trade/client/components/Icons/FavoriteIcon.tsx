import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { IconBaseProps } from '@nadohq/web-ui';
import { Icons } from '@nadohq/web-ui/components/Icons/icons';

interface FavoriteIconProps extends IconBaseProps {
  isFavorited: boolean;
  disabled?: boolean;
}

export function FavoriteIcon({
  isFavorited,
  disabled,
  className,
  ...iconProps
}: WithClassnames<FavoriteIconProps>) {
  const Icon = isFavorited ? Icons.StarFill : Icons.Star;

  const iconStyle = (() => {
    if (disabled) {
      return 'text-disabled';
    }
    if (isFavorited) {
      return 'text-accent-warning';
    }
    return 'text-text-tertiary hover:text-text-secondary';
  })();

  return (
    <Icon className={joinClassNames(iconStyle, className)} {...iconProps} />
  );
}
