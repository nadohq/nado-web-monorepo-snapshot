import { Icons, SecondaryButton, TextButton } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { useUserStateError } from 'client/hooks/subaccount/useUserStateError';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';
import { PerpTpSlCellTooltip } from 'client/modules/tables/cells/PerpTpSlCell/PerpTpSlCellTooltip';
import { PerpTpSlPrices } from 'client/modules/tables/cells/PerpTpSlCell/PerpTpSlPrices';
import { PerpPositionsTableItem } from 'client/modules/tables/types/PerpPositionsTableItem';
import { useTranslation } from 'react-i18next';

interface Props extends TableCellProps {
  productId: number;
  isIso: boolean;
  tpSlData: PerpPositionsTableItem['tpSl'] | undefined;
  priceFormatSpecifier: string;
  averageEntryPrice: BigNumber | undefined;
  positionAmount: BigNumber | undefined;
}

export function PerpTpSlCell({
  productId,
  tpSlData,
  isIso,
  priceFormatSpecifier,
  averageEntryPrice,
  positionAmount,
  ...rest
}: Props) {
  const { t } = useTranslation();
  const { show } = useDialog();
  const userStateError = useUserStateError();
  const isSingleSignatureSession = useIsSingleSignatureSession();

  const hasTpSlOrders =
    !!tpSlData?.slTriggerPrice || !!tpSlData?.tpTriggerPrice;

  const content = (() => {
    if (hasTpSlOrders) {
      return (
        <div className="flex items-center">
          <PerpTpSlCellTooltip
            orders={tpSlData?.allOrders}
            productId={productId}
            hasMultipleTpOrSlOrders={!!tpSlData?.hasMultipleTpOrSlOrders}
            averageEntryPrice={averageEntryPrice}
            positionAmount={positionAmount}
          >
            <PerpTpSlPrices
              tpTriggerPrice={tpSlData?.tpTriggerPrice}
              slTriggerPrice={tpSlData?.slTriggerPrice}
              priceFormatSpecifier={priceFormatSpecifier}
              hasMultipleTpOrSlOrders={!!tpSlData?.hasMultipleTpOrSlOrders}
              numTpSlOrders={tpSlData?.allOrders?.length ?? 0}
            />
          </PerpTpSlCellTooltip>
          <TextButton
            aria-label={t(($) => $.buttons.manageTpSl)}
            colorVariant="secondary"
            className="p-2 text-xs"
            startIcon={<Icons.PencilSimpleFill />}
            dataTestId="perp-positions-table-manage-tp-sl-button"
            onClick={() =>
              show({
                type: 'manage_tp_sl',
                params: {
                  productId,
                  isIso,
                },
              })
            }
          />
        </div>
      );
    }

    // Add / invalid state buttons for when there are no orders
    const { message, onClick, startIcon } = (() => {
      if (!isSingleSignatureSession) {
        return {
          startIcon: undefined,
          message: t(($) => $.buttons.enable1CT),
          onClick: () => show({ type: 'signature_mode_settings', params: {} }),
        };
      } else if (userStateError === 'requires_sign_once_approval') {
        return {
          startIcon: undefined,
          message: t(($) => $.buttons.approve1CT),
          onClick: () =>
            show({ type: 'single_signature_reapproval', params: {} }),
        };
      } else {
        return {
          startIcon: <Icons.Plus size={12} />,
          message: t(($) => $.buttons.add),
          onClick: () =>
            show({
              type: 'add_tp_sl',
              params: {
                productId,
                isIso,
              },
            }),
        };
      }
    })();

    return (
      <SecondaryButton
        size="xs"
        startIcon={startIcon}
        onClick={onClick}
        data-testid="perp-positions-table-tp-sl-add-button"
      >
        {message}
      </SecondaryButton>
    );
  })();

  return <TableCell {...rest}>{content}</TableCell>;
}
