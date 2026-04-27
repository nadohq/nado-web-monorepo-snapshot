import {
  BaseTestProps,
  joinClassNames,
  mergeClassNames,
  WithClassnames,
  WithRef,
} from '@nadohq/web-common';
import { SizeVariant } from '../..';
import { Button } from '../Button';
import { Icons } from '../Icons';
import { Input } from '../Input';

interface Props
  extends BaseTestProps, WithRef<WithClassnames, HTMLInputElement> {
  query: string;
  setQuery: (query: string) => void;
  placeholder: string;
  textAreaClassName?: string;
  hideSearchIcon?: boolean;
  sizeVariant?: Extract<SizeVariant, 'xs' | 'base'>;
}

export function SearchBox({
  query,
  setQuery,
  placeholder,
  className,
  textAreaClassName,
  hideSearchIcon,
  sizeVariant,
  ref,
  dataTestId,
}: Props) {
  const onClear = () => {
    setQuery('');
  };

  const iconClassNames = 'text-text-tertiary size-3 shrink-0';

  const fontSizeClass = {
    xs: 'text-xs',
    base: 'text-sm',
  }[sizeVariant ?? 'base'];

  return (
    <div
      className={mergeClassNames(
        'flex items-center gap-x-1 p-1.5',
        'bg-surface-2 rounded-md',
        className,
      )}
    >
      {!hideSearchIcon && (
        <div className="flex items-center justify-center p-1">
          <Icons.MagnifyingGlass className={iconClassNames} />
        </div>
      )}
      <Input.TextArea
        className={joinClassNames(fontSizeClass, textAreaClassName)}
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        ref={ref}
        dataTestId={dataTestId}
      />
      {!!query && (
        <Button
          startIcon={<Icons.X className={iconClassNames} />}
          onClick={onClear}
        />
      )}
    </div>
  );
}
