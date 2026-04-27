import { SelectValue, useSelect, UseSelectParams } from '@nadohq/web-ui';
import { PrimitiveAtom, useAtom } from 'jotai';

export interface UseAtomControlledSelectParams<
  TValue extends SelectValue,
> extends Omit<
  UseSelectParams<TValue>,
  'onSelectedValueChange' | 'selectedValue'
> {
  valueAtom: PrimitiveAtom<TValue>;
}

export function useAtomControlledSelect<TValue extends SelectValue>({
  valueAtom,
  ...rest
}: UseAtomControlledSelectParams<TValue>) {
  const [value, setValue] = useAtom(valueAtom);

  return useSelect({
    onSelectedValueChange: setValue,
    selectedValue: value,
    ...rest,
  });
}
