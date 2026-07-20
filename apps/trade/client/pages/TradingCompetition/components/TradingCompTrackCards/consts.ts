import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import type { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';
import type { TradingCompTrackType } from 'client/modules/tradingCompetition/types';

interface TradingCompTrackDisplayConfig {
  qualificationTooltipId: DefinitionTooltipID;
  metricTooltipId: DefinitionTooltipID;
  metricFormatSpecifier: PresetNumberFormatSpecifier;
}

export const TRADING_COMP_TRACK_DISPLAY_CONFIG: Record<
  TradingCompTrackType,
  TradingCompTrackDisplayConfig
> = {
  roi: {
    qualificationTooltipId: 'tradingCompRoiTrackEligibility',
    metricTooltipId: 'tradingCompRoi',
    metricFormatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
  },
  volume: {
    qualificationTooltipId: 'tradingCompVolumeTrackEligibility',
    metricTooltipId: 'tradingCompVolume',
    metricFormatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
  },
};
