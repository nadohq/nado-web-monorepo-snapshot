import { WithChildren } from '@nadohq/web-common';
import { ReactNode } from 'react';

interface Props extends WithChildren {
  /**
   * Optional label for the section
   */
  label?: ReactNode;
}

/**
 * Reusable section component for order form inputs.
 * Provides consistent spacing and optional label styling.
 */
export function OrderFormInputsSection({ label, children }: Props) {
  return (
    <div className="flex flex-col gap-y-2">
      {label && <div className="text-text-tertiary text-xs">{label}</div>}
      {children}
    </div>
  );
}
