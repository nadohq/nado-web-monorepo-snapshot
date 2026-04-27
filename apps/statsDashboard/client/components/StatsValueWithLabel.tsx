import { formatNumber, NumberFormatValue } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { Label, Value } from '@nadohq/web-ui';
import { ReactNode } from 'react';

interface WithFormatValue {
  value: NumberFormatValue | undefined;
  formatSpecifier: string;
}

interface WithValueContent {
  valueContent: ReactNode;
}

type Props = {
  label: string;
  valueEndElement?: ReactNode;
  valueClassName?: string;
} & (WithFormatValue | WithValueContent);

export function StatsValueWithLabel({
  label,
  valueEndElement,
  valueClassName,
  ...unionProps
}: Props) {
  const valueContent = (() => {
    if ('valueContent' in unionProps) {
      const { valueContent } = unionProps;
      return valueContent;
    }

    const { value, formatSpecifier } = unionProps;
    return formatNumber(value, {
      formatSpecifier,
    });
  })();

  return (
    <div className="flex flex-col items-start gap-y-1">
      <Label className="text-text-secondary font-medium" sizeVariant="sm">
        {label}
      </Label>
      <Value
        className={joinClassNames('font-semibold', valueClassName)}
        sizeVariant="xl"
        endElement={valueEndElement}
      >
        {valueContent}
      </Value>
    </div>
  );
}
