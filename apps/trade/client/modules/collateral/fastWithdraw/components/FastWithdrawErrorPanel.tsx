import { Icons } from '@nadohq/web-ui';
import { ErrorPanel } from 'client/components/ErrorPanel';
import { FastWithdrawFormError } from 'client/modules/collateral/fastWithdraw/hooks/useFastWithdrawForm';
import { useTranslation } from 'react-i18next';

export function FastWithdrawErrorPanel({
  formError,
}: {
  formError: FastWithdrawFormError | undefined;
}) {
  const { t } = useTranslation();

  if (!formError) return null;

  const errorContentData = {
    insufficient_liquidity: {
      title: t(($) => $.errors.insufficientLiquidity.title),
      description: t(($) => $.errors.insufficientLiquidity.description),
    },
    withdrawal_size_below_minimum_value: {
      title: t(($) => $.errors.withdrawalBelowMinimum.title),
      description: t(($) => $.errors.withdrawalBelowMinimum.description),
    },
    withdrawal_completed: {
      title: t(($) => $.errors.withdrawalAlreadyCompleted.title),
      description: t(($) => $.errors.withdrawalAlreadyCompleted.description),
    },
  }[formError];

  return (
    <ErrorPanel className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-1.5">
        <Icons.Warning size={14} />
        {errorContentData.title}
      </div>
      <p>{errorContentData.description}</p>
    </ErrorPanel>
  );
}
