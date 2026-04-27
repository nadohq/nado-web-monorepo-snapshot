import { NLP_PRODUCT_ID } from '@nadohq/client';
import { joinClassNames } from '@nadohq/web-common';
import {
  ButtonAsHTMLButtonProps,
  IconButton,
  IconComponent,
  Icons,
  SecondaryButton,
} from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { SpotMoreActionsDropdownMenu } from 'client/components/SpotMoreActionsDropdownMenu';
import { useShowDialogForProduct } from 'client/hooks/ui/navigation/useShowDialogForProduct';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { ROUTES } from 'client/modules/app/consts/routes';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface SpotActionButtonCellProps extends TableCellProps {
  productId: number;
  balanceAmount: BigNumber;
  symbol: string;
}

export function SpotActionButtonCell({
  productId,
  balanceAmount,
  className,
  symbol,
  ...rest
}: SpotActionButtonCellProps) {
  const { t } = useTranslation();
  const isConnected = useIsConnected();
  const showDialogForProduct = useShowDialogForProduct();

  const disableActions = !isConnected;

  const cellContent = (() => {
    if (productId === NLP_PRODUCT_ID) {
      return (
        <SecondaryButton as={Link} href={ROUTES.vault} size="xs">
          {t(($) => $.buttons.goToVault)}
        </SecondaryButton>
      );
    }

    return (
      <>
        <ResponsiveActionButton
          label={t(($) => $.buttons.deposit)}
          symbol={symbol}
          icon={Icons.ArrowDownLeft}
          onClick={() => {
            showDialogForProduct({
              dialogType: 'deposit_options',
              productId,
            });
          }}
          disabled={disableActions}
        />
        <ResponsiveActionButton
          label={t(($) => $.buttons.withdraw)}
          symbol={symbol}
          icon={Icons.ArrowUpRight}
          onClick={() => {
            showDialogForProduct({
              dialogType: 'withdraw',
              productId,
            });
          }}
          disabled={disableActions}
        />
        <SpotMoreActionsDropdownMenu
          triggerSizeVariant="xs"
          productId={productId}
          balanceAmount={balanceAmount}
        />
      </>
    );
  })();

  return (
    <TableCell
      className={joinClassNames('flex justify-end gap-x-2', className)}
      {...rest}
    >
      {cellContent}
    </TableCell>
  );
}

/**
 * Renders an IconButton on mobile and SecondaryButton on desktop
 */
function ResponsiveActionButton({
  onClick,
  label,
  symbol,
  icon,
  disabled,
}: Pick<ButtonAsHTMLButtonProps, 'onClick' | 'disabled'> & {
  label: string;
  icon: IconComponent;
  symbol: string;
}) {
  return (
    <>
      <IconButton
        tooltipLabel={`${label} ${symbol}`}
        size="sm"
        icon={icon}
        disabled={disabled}
        onClick={onClick}
        className="lg:hidden"
      />
      <SecondaryButton
        size="xs"
        onClick={onClick}
        disabled={disabled}
        className="hidden lg:flex"
      >
        {label}
      </SecondaryButton>
    </>
  );
}
