import {
  PresetNumberFormatSpecifier,
  SUBACCOUNT_LIMIT,
  useSubaccountContext,
} from '@nadohq/react-client';
import { Icons, LinkButton, SecondaryButton } from '@nadohq/web-ui';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useRepeatedClickCountHandler } from 'client/hooks/ui/useRepeatedClickCountHandler';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ManageSubaccountsDialogSubaccountCard } from 'client/modules/subaccounts/components/dialogs/ManageSubaccountsDialog/ManageSubaccountsDialogSubaccountCard';
import { useAllSubaccountsWithMetrics } from 'client/modules/subaccounts/hooks/useAllSubaccountsWithMetrics';
import { useCumulativePortfolioValueUsd } from 'client/modules/subaccounts/hooks/useCumulativePortfolioValueUsd';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function ManageSubaccountsDialog() {
  const { t } = useTranslation();
  const { currentSubaccount, canAddSubaccount, appSubaccountNames } =
    useSubaccountContext();
  const subaccountsWithMetrics = useAllSubaccountsWithMetrics();
  const cumulativePortfolioValueUsd = useCumulativePortfolioValueUsd();
  const { hide, push } = useDialog();

  // Hidden feature for MM's to access alternate subaccounts.
  const handleTitleClick = useRepeatedClickCountHandler({
    handler: (count) => {
      if (count === 3) {
        push({ type: 'change_subaccount', params: {} });
      }
    },
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title
        onClose={hide}
        endElement={
          <LinkButton
            className="text-sm"
            colorVariant="secondary"
            as={Link}
            href={LINKS.multipleSubaccountsDocs}
            withExternalIcon
            external
          >
            {t(($) => $.buttons.docs)}
          </LinkButton>
        }
      >
        <div onClick={handleTitleClick}>{t(($) => $.accounts)}</div>
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        <div className="flex gap-x-10">
          <ValueWithLabel.Vertical
            sizeVariant="lg"
            label={t(($) => $.totalBalance)}
            tooltip={{ id: 'totalAccountBalance' }}
            value={cumulativePortfolioValueUsd}
            numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
          />
          <ValueWithLabel.Vertical
            sizeVariant="lg"
            label={t(($) => $.accounts)}
            // Use # of app subaccounts as there might be other subaccounts created via API
            valueContent={appSubaccountNames.length}
            valueEndElement={
              <span className="text-sm">
                {t(($) => $.subaccountLimit, { count: SUBACCOUNT_LIMIT })}
              </span>
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-4">
          {subaccountsWithMetrics.map((subaccount) => (
            <ManageSubaccountsDialogSubaccountCard
              key={subaccount.subaccountName}
              subaccount={subaccount}
              isActive={currentSubaccount.name === subaccount.subaccountName}
            />
          ))}
        </div>
      </BaseAppDialog.Body>
      <BaseAppDialog.Footer className="flex gap-x-2 sm:gap-x-3">
        {canAddSubaccount && (
          <SecondaryButton
            className="flex-1 px-0"
            startIcon={<Icons.Plus />}
            onClick={() => push({ type: 'create_subaccount', params: {} })}
          >
            {t(($) => $.buttons.addAccount)}
          </SecondaryButton>
        )}
        <SecondaryButton
          className="flex-1 px-0"
          startIcon={<Icons.ArrowsLeftRight />}
          onClick={() =>
            push({ type: 'subaccount_quote_transfer', params: {} })
          }
        >
          {t(($) => $.buttons.transferFunds)}
        </SecondaryButton>
      </BaseAppDialog.Footer>
    </BaseAppDialog.Container>
  );
}
