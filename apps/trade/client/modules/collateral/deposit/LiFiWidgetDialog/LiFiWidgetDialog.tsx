'use client';

import { BrandLoadingWrapper } from 'client/components/BrandIconLoadingWrapper/BrandLoadingWrapper';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { LiFiWidgetDialogParams } from 'client/modules/collateral/deposit/LiFiWidgetDialog/types';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const LazyLifiWidget = lazy(
  () => import('client/modules/collateral/deposit/LiFiWidgetDialog/LiFiWidget'),
);

export function LiFiWidgetDialog({
  directDepositAddress,
}: LiFiWidgetDialogParams) {
  const { t } = useTranslation();
  const { hide } = useDialog();

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.crossChainDeposit)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body className="p-0">
        <Suspense
          fallback={
            <BrandLoadingWrapper
              isLoading={true}
              indicatorContainerClassName="min-h-[500px]"
            />
          }
        >
          <LazyLifiWidget directDepositAddress={directDepositAddress} />
        </Suspense>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
