import { BigNumberish } from '@nadohq/client';
import { signDependentValue } from '@nadohq/react-client';

export function getSignDependentColorClassName(
  value: BigNumberish | undefined,
) {
  return signDependentValue(value, {
    positive: 'text-positive',
    negative: 'text-negative',
    // If zero, allow the color to be inherited from the parent
    zero: undefined,
  });
}
