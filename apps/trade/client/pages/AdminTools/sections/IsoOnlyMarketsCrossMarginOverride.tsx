'use client';

import { WithClassnames } from '@nadohq/web-common';
import { SectionedCard, Switch } from '@nadohq/web-ui';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const TOGGLE_ID = 'iso-only-markets-cross-margin-override';

export function IsoOnlyMarketsCrossMarginOverride({
  className,
}: WithClassnames) {
  const { t } = useTranslation();
  const { savedUserState, setSavedUserState } = useSavedUserState();

  const enabled = savedUserState.trading.enableCrossMarginForIsoOnlyMarkets;

  const onCheckedChange = useCallback(
    (newValue: boolean) => {
      setSavedUserState((prev) => {
        prev.trading.enableCrossMarginForIsoOnlyMarkets = newValue;
        return prev;
      });
    },
    [setSavedUserState],
  );

  return (
    <SectionedCard className={className}>
      <SectionedCard.Header>
        {t(($) => $.isoOnlyMarketsCrossMarginOverride.header)}
      </SectionedCard.Header>
      <SectionedCard.Content className="flex flex-col gap-y-3">
        <p className="text-sm">
          {t(($) => $.isoOnlyMarketsCrossMarginOverride.description)}
        </p>
        <Switch.Row>
          <Switch.Label id={TOGGLE_ID}>
            {t(($) => $.isoOnlyMarketsCrossMarginOverride.toggleLabel)}
          </Switch.Label>
          <Switch.Toggle
            id={TOGGLE_ID}
            checked={enabled}
            onCheckedChange={onCheckedChange}
          />
        </Switch.Row>
      </SectionedCard.Content>
    </SectionedCard>
  );
}
