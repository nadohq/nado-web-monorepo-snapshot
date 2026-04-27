'use client';

import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { ValueWithLabelProps } from 'client/components/ValueWithLabel/types';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';

interface Props extends WithClassnames {
  anchorId?: string;
  title: string;
  metricsItems: ValueWithLabelProps[];
}

export function MarginManagerMetrics({
  anchorId,
  title,
  metricsItems,
  className,
}: Props) {
  return (
    <div className={joinClassNames('flex flex-col gap-y-4', className)}>
      <h4 id={anchorId} className="text-text-primary text-base font-medium">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-6 lg:flex lg:flex-wrap lg:gap-x-12">
        {metricsItems.map((props, index) => (
          <ValueWithLabel.Vertical sizeVariant="lg" key={index} {...props} />
        ))}
      </div>
    </div>
  );
}
