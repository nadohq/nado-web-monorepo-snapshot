import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { Icons } from '@nadohq/web-ui';

interface Props extends WithClassnames {
  size: number;
}

export function CheckmarkIcon({ size, className }: Props) {
  return (
    <div
      className={mergeClassNames('bg-accent/20 rounded-full p-4', className)}
      style={{
        width: size,
        height: size,
      }}
    >
      <Icons.CheckBold className="h-full w-full" />
    </div>
  );
}
