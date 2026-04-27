import { DateTime } from 'client/components/DateTime';

export function MobileDataTabCardDateTime({
  timestampMillis,
}: {
  timestampMillis: number;
}) {
  return (
    <DateTime
      timestampMillis={timestampMillis}
      className="text-text-tertiary flex gap-x-1 text-xs"
    />
  );
}
