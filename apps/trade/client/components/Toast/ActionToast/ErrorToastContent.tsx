import { Card, TextButton } from '@nadohq/web-ui';
import { ParsedExecuteError } from 'client/utils/errors/parseExecuteError';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorToastContentProps {
  error: ParsedExecuteError;
}

export function ErrorToastContent({ error }: ErrorToastContentProps) {
  const [isDetailedErrorExpanded, setIsDetailedErrorExpanded] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start gap-2">
      <div>{error.errorMessage}</div>
      {!!error.detailedErrorMessage && (
        <>
          {isDetailedErrorExpanded && (
            <Card className="bg-surface-1 max-h-30 w-full overflow-y-auto p-1 break-all">
              {error.detailedErrorMessage}
            </Card>
          )}
          <TextButton
            colorVariant="tertiary"
            className="text-xs"
            onClick={() => setIsDetailedErrorExpanded(!isDetailedErrorExpanded)}
          >
            {!isDetailedErrorExpanded
              ? t(($) => $.buttons.showMore)
              : t(($) => $.buttons.showLess)}
          </TextButton>
        </>
      )}
    </div>
  );
}
