import {
  ColorVar,
  getResolvedColorValue,
} from 'client/modules/theme/colorVars';
import { IChartingLibraryWidget } from 'public/charting_library';
import { useEffect } from 'react';

// Bridges host-app theme colors into the TV iframe so `nado-chart-overrides.css`
// can use Nado brand colors (the iframe can't see the host app's CSS vars).
const CSS_VAR_BRIDGE: Record<string, ColorVar> = {
  '--nado-color-positive': 'positive',
  '--nado-color-negative': 'negative',
  '--nado-color-text-button-primary': 'text-button-primary',
};

export function useApplyChartCssVars(
  tvWidget: IChartingLibraryWidget | undefined,
) {
  useEffect(() => {
    if (!tvWidget) {
      return;
    }

    Object.entries(CSS_VAR_BRIDGE).forEach(([cssVar, colorVarName]) => {
      tvWidget.setCSSCustomProperty(
        cssVar,
        getResolvedColorValue(colorVarName),
      );
    });
  }, [tvWidget]);
}
