import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Icons } from './Icons';

export interface DisclosureCardProps extends WithClassnames {
  title?: ReactNode;
  description: ReactNode;
  titleClassName?: string;
  onDismiss?: () => void;
}

export function DisclosureCard({
  className,
  title,
  titleClassName,
  description,
  onDismiss,
}: DisclosureCardProps) {
  return (
    <Card
      className={mergeClassNames(
        'bg-surface-1 flex items-start p-2',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-y-1.5">
        <div
          className={mergeClassNames(
            'text-text-primary text-sm',
            'empty:hidden',
            titleClassName,
          )}
        >
          {title}
        </div>
        {/* description is usually multi-line so we use normal line height */}
        <div className="text-text-tertiary text-xs leading-normal">
          {description}
        </div>
      </div>
      {onDismiss && (
        <Button endIcon={<Icons.X size={14} />} onClick={onDismiss} />
      )}
    </Card>
  );
}
