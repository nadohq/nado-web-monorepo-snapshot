import { ErrorPanel } from 'client/components/ErrorPanel';
import { RepayConvertFormErrorType } from 'client/modules/collateral/repay/hooks/useRepayConvertForm/types';
import { useTranslation } from 'react-i18next';

export function RepayConvertFormErrorPanel({
  formError,
}: {
  formError: RepayConvertFormErrorType | undefined;
}) {
  const { t } = useTranslation();

  const content = (() => {
    switch (formError) {
      case 'no_available_source':
        return t(($) => $.errors.noAvailableBalancesToConvert);
      case 'not_borrowing':
        return t(($) => $.errors.notBorrowingThisAsset);
      default:
        return;
    }
  })();

  if (!content) {
    return null;
  }

  return <ErrorPanel>{content}</ErrorPanel>;
}
