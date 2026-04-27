import {
  BaseTestProps,
  joinClassNames,
  mergeClassNames,
  WithRef,
} from '@nadohq/web-common';
import { ReactNode } from 'react';
import { getStateOverlayClassNames } from '../../utils';
import { ErrorTooltip } from '../Tooltip';
import { Input, InputTextAreaProps } from './Input';

export interface CompactInputProps
  extends
    BaseTestProps,
    Omit<WithRef<InputTextAreaProps, HTMLInputElement>, 'placeholder'> {
  textAreaClassName?: string;
  startElement?: ReactNode;
  endElement?: ReactNode;
  errorTooltipContent?: ReactNode;
  inputContainerClassName?: string;
  placeholder: string;
}

export function CompactInput({
  endElement,
  inputContainerClassName,
  className,
  textAreaClassName,
  startElement,
  placeholder,
  errorTooltipContent,
  disabled,
  readOnly,
  dataTestId,
  ...inputProps
}: CompactInputProps) {
  const disabledStateOverlayClassNames = getStateOverlayClassNames({
    disabled: true,
  });

  return (
    <ErrorTooltip
      contentWrapperClassName={className}
      errorContent={errorTooltipContent}
    >
      <Input.Container
        className={mergeClassNames(
          'flex items-center gap-x-1.5 transition-colors',
          'bg-surface-1 h-9 overflow-hidden rounded-sm px-2',
          disabled && disabledStateOverlayClassNames,
          inputContainerClassName,
        )}
        isError={!!errorTooltipContent}
        readOnly={readOnly}
        disabled={disabled}
      >
        {startElement}
        <Input.TextArea
          className={joinClassNames(
            'flex-1 text-sm',
            !!errorTooltipContent && !disabled
              ? 'text-negative'
              : 'text-text-primary',
            textAreaClassName,
          )}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          data-testid={dataTestId}
          {...inputProps}
        />
        <span className="text-text-tertiary text-xs empty:hidden">
          {endElement}
        </span>
      </Input.Container>
    </ErrorTooltip>
  );
}
