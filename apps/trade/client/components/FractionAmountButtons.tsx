import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { SecondaryButton } from '@nadohq/web-ui';

const fractions = [0.25, 0.5, 0.75, 1];

interface Props extends WithClassnames {
  disabled?: boolean;
  onFractionSelected: (fraction: number) => void;
}

export function FractionAmountButtons({
  className,
  disabled,
  onFractionSelected,
}: Props) {
  return (
    <div
      className={joinClassNames(
        'flex w-full items-center justify-between gap-x-1',
        disabled && 'cursor-not-allowed',
        className,
      )}
    >
      {fractions.map((fraction, index) => {
        return (
          <FractionAmountButton
            key={index}
            fraction={fraction}
            disabled={disabled}
            onFractionSelected={() => onFractionSelected(fraction)}
          />
        );
      })}
    </div>
  );
}

interface FractionAmountButtonProps {
  fraction: number;
  disabled?: boolean;
  onFractionSelected: () => void;
}

function FractionAmountButton({
  disabled,
  fraction,
  onFractionSelected,
}: FractionAmountButtonProps) {
  return (
    <SecondaryButton
      className="flex-1"
      size="xs"
      onClick={onFractionSelected}
      disabled={disabled}
    >
      {formatNumber(fraction, {
        formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_INT,
      })}
    </SecondaryButton>
  );
}
