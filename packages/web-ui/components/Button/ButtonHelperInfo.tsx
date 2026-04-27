import {
  joinClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';

function Container({ children, className }: WithChildren<WithClassnames>) {
  return (
    <div className={joinClassNames('flex flex-col gap-y-2', className)}>
      {children}
    </div>
  );
}

function Content({ children, className }: WithClassnames<WithChildren>) {
  return (
    <div
      className={joinClassNames(
        'text-text-primary text-center text-xs',
        'leading-normal',
        className,
      )}
    >
      {children}
    </div>
  );
}

export const ButtonHelperInfo = {
  Container,
  Content,
};
