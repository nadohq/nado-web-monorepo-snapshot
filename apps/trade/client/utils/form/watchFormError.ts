import { get } from 'lodash';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

export function watchFormError<TValues extends FieldValues, TError>(
  form: UseFormReturn<TValues>,
  valueKey: Path<TValues>,
): TError | undefined {
  const error = get(form.formState.errors, valueKey);

  return error?.message as TError;
}
