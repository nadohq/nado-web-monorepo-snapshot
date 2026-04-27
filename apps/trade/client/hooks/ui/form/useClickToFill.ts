import { useCallback, useRef } from 'react';
import { FieldPathByValue, FieldValues, UseFormReturn } from 'react-hook-form';

interface UseClickToFillParams<TFieldValues extends FieldValues> {
  /** The react-hook-form instance to control. */
  form: UseFormReturn<TFieldValues>;
  /** The field to fill when no field has been explicitly focused. */
  defaultField?: FieldPathByValue<TFieldValues, string>;
}

interface UseClickToFillReturn<TFieldValues extends FieldValues> {
  /** Sets the field that will receive the next clicked value. */
  setActiveField: (field: FieldPathByValue<TFieldValues, string>) => void;
  /** Fills the active field with the given value, validates it, and focuses it. */
  handleValueClick: (value: string) => void;
}

/**
 * Manages click-to-fill behavior for form fields, allowing external values
 * to be directed into whichever field is currently active.
 *
 * @param params.form - The react-hook-form instance to control.
 * @param params.defaultField - The field to fill when no field has been explicitly focused.
 * @returns Handlers to set and fill the active field with a clicked value.
 */
export function useClickToFill<TFieldValues extends FieldValues>({
  form,
  defaultField,
}: UseClickToFillParams<TFieldValues>): UseClickToFillReturn<TFieldValues> {
  type FieldPath = FieldPathByValue<TFieldValues, string>;

  const activeFieldRef = useRef<FieldPath | null>(defaultField ?? null);

  // React hook form doesn't work too well with constrained generics, so force cast here.
  const typedForm = form as unknown as UseFormReturn<Record<string, string>>;

  const setActiveField = useCallback((field: FieldPath) => {
    activeFieldRef.current = field;
  }, []);

  const handleValueClick = useCallback(
    (value: string) => {
      const field = activeFieldRef.current;
      if (!field) {
        return;
      }

      typedForm.setValue(field as string, value, {
        shouldValidate: true,
        shouldTouch: true,
      });

      typedForm.setFocus(field as string);
    },
    [typedForm],
  );

  return { setActiveField, handleValueClick };
}
