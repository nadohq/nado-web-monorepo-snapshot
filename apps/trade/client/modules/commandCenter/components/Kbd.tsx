import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { IconComponent } from '@nadohq/web-ui';

interface Props extends WithClassnames {
  icon?: IconComponent;
  iconClassname?: string;
  text?: string;
}

export function Kbd({ icon: Icon, text, className, iconClassname }: Props) {
  return (
    <div
      className={mergeClassNames(
        'bg-surface-2 text-text-primary flex min-h-6 min-w-6 items-center justify-center rounded-sm py-1 text-xs',
        !!Icon ? 'px-1' : 'px-2',
        className,
      )}
    >
      {Icon && <Icon className={iconClassname} />}
      {text}
    </div>
  );
}
