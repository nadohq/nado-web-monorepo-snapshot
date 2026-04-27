import {
  joinClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';

interface Props extends WithChildren, WithClassnames {
  contentContainerClassName?: string;
}

export function DotsContainer({
  children,
  className,
  contentContainerClassName,
}: Props) {
  return (
    <div className={joinClassNames('flex flex-col', className)}>
      <DotsRow />
      <div className={joinClassNames('mx-1 flex-1', contentContainerClassName)}>
        {children}
      </div>
      <DotsRow />
    </div>
  );
}

function DotsRow() {
  return (
    <div className="flex justify-between">
      <Dot />
      <Dot />
    </div>
  );
}

function Dot() {
  return <div className="bg-text-primary h-[5px] w-1" />;
}
