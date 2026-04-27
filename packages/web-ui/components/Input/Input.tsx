import {
  BaseTestProps,
  mergeClassNames,
  WithChildren,
  WithClassnames,
  WithRef,
} from '@nadohq/web-common';
import { ComponentProps, InputHTMLAttributes, useId, useMemo } from 'react';

export type InputTextAreaProps = WithRef<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> &
  BaseTestProps;

function TextArea({
  id,
  className,
  readOnly,
  type,
  disabled,
  dataTestId,
  ...rest
}: InputTextAreaProps) {
  const generatedId = useId();
  const inputId = useMemo(() => id ?? generatedId, [generatedId, id]);

  return (
    <input
      id={inputId}
      name={inputId}
      className={mergeClassNames(
        // `w-full` to prevent the input from expanding to fit its `size` attribute
        'w-full bg-transparent',
        'text-text-primary',
        'placeholder:text-text-tertiary placeholder:font-normal',
        disabled && 'cursor-not-allowed',
        readOnly && 'cursor-auto',
        className,
      )}
      autoComplete="off"
      step="any"
      type={type}
      disabled={disabled}
      readOnly={readOnly}
      data-testid={dataTestId}
      {...rest}
    />
  );
}

export interface InputContainerProps extends WithChildren, WithClassnames {
  isError?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

function Container({
  isError,
  children,
  className,
  disabled,
  readOnly,
}: InputContainerProps) {
  const stateClassNames = (() => {
    if (disabled) {
      return 'cursor-not-allowed border-disabled';
    }

    if (isError) {
      return 'border-negative';
    }

    return ['border-transparent', !readOnly && 'focus-within:border-primary'];
  })();

  return (
    <div className={mergeClassNames('border', stateClassNames, className)}>
      {children}
    </div>
  );
}

function Label({ className, ...rest }: ComponentProps<'label'>) {
  return (
    <label
      className={mergeClassNames('text-text-tertiary', className)}
      {...rest}
    />
  );
}

export const Input = {
  TextArea,
  Label,
  Container,
};
