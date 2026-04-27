import { Icons, SecondaryButton } from '@nadohq/web-ui';

interface Props {
  pageIndex: number;
  canPreviousPage: boolean;
  canNextPage: boolean;

  previousPage(): void;

  nextPage(): void;
}

export function Pagination({
  pageIndex,
  canNextPage,
  canPreviousPage,
  nextPage,
  previousPage,
}: Props) {
  return (
    <div className="flex items-center">
      <SecondaryButton
        size="xs"
        onClick={() => previousPage()}
        disabled={!canPreviousPage}
      >
        <Icons.CaretLeft size={20} />
      </SecondaryButton>
      <div className="text-text-primary flex h-full min-w-10 items-center justify-center px-3 text-sm font-medium">
        {pageIndex + 1}
      </div>
      <SecondaryButton
        size="xs"
        onClick={() => nextPage()}
        disabled={!canNextPage}
      >
        <Icons.CaretRight size={20} />
      </SecondaryButton>
    </div>
  );
}
