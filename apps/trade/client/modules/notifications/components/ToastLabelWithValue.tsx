import { mergeClassNames } from '@nadohq/web-common';
import type { ReactNode } from 'react';

interface ToastLabelWithValueProps {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
}

/**
 * Displays a label/value pair inside a toast/notification with consistent formatting
 * @param label - The label text
 * @param value - The value to display next to the label
 * @param className - Optional additional className for the container
 * @param valueClassName - Optional className for the value text
 * @returns A formatted label/value display component for notifications
 */
export function ToastLabelWithValue({
  label,
  value,
  className,
  valueClassName,
}: ToastLabelWithValueProps) {
  return (
    <div className={mergeClassNames('flex items-center gap-x-1', className)}>
      <span className="text-text-tertiary">{label}:</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
