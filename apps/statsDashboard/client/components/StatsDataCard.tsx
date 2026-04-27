import {
  joinClassNames,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { Card, IconButton, Icons, Spinner } from '@nadohq/web-ui';
import { ReactNode } from 'react';

interface DownloadCsvOptions {
  onDownload: () => void;
  isDisabled: boolean;
}

export interface StatsDataCardProps<TData>
  extends WithChildren, WithClassnames {
  title: string;
  description: string;
  contentClassName?: string;
  headerSelectComponent?: ReactNode;
  data: TData[] | undefined;
  /**
   * Optional download CSV functionality.
   * If provided, a button will be rendered in the header to trigger CSV download.
   */
  downloadCsv?: DownloadCsvOptions;
  isLoading: boolean;
}

export function StatsDataCard<TData>({
  className,
  description,
  headerSelectComponent,
  title,
  data,
  isLoading,
  contentClassName,
  children,
  downloadCsv,
}: StatsDataCardProps<TData>) {
  const content = (() => {
    // Show loading spinner if loading or data not available yet.
    if (data == null || isLoading) {
      return <Spinner />;
    }

    // Show message if there is no data available
    if (data?.length === 0) {
      return <div className="text-text-tertiary">No data available</div>;
    }

    return children;
  })();

  return (
    <Card
      className={joinClassNames(
        'flex min-h-96 flex-col gap-3',
        'p-3 sm:px-5 sm:py-4',
        className,
      )}
    >
      <CardHeader
        title={title}
        description={description}
        headerSelectComponent={headerSelectComponent}
        downloadCsv={downloadCsv}
      />
      <div
        className={mergeClassNames(
          'flex flex-1 items-center justify-center',
          contentClassName,
        )}
      >
        {content}
      </div>
    </Card>
  );
}

function CardHeader({
  title,
  description,
  headerSelectComponent,
  downloadCsv,
}: {
  title: string;
  description: string;
  headerSelectComponent: ReactNode;
  downloadCsv?: DownloadCsvOptions;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-col gap-y-0.5">
          <div className="text-text-primary text-sm font-semibold">{title}</div>
          <p className="text-text-secondary text-xs font-medium sm:text-sm">
            {description}
          </p>
        </div>
        {headerSelectComponent}
      </div>
      {downloadCsv && (
        <IconButton
          as="button"
          size="sm"
          disabled={downloadCsv.isDisabled}
          icon={Icons.DownloadSimple}
          onClick={downloadCsv.onDownload}
        />
      )}
    </div>
  );
}
