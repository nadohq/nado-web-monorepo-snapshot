import { getResolvedColorValue } from 'client/modules/theme/colorVars';
import { CustomThemeColors } from 'public/charting_library/charting_library';

function solid(hex: string) {
  return Array.from({ length: 19 }, () => hex);
}

export function getCustomThemes() {
  // TV's grey ladder (19 shades, lightest→darkest), rescaled so the darkest
  // shade matches `surface-card` rather than black. The static values were
  // precomputed from TV's cold-gray palette using that ratio.
  const greyShades = [
    '#f9f9f9',
    '#ebebeb',
    '#dddddd',
    '#bfbfc0',
    '#a1a1a2',
    '#878789',
    '#727274',
    '#646466',
    '#535355',
    '#47474a',
    '#3a3a3d',
    '#313134',
    '#2a2a2d',
    '#242426',
    '#1e1e21',
    '#1a1a1d',
    '#161619',
    '#141417',
    getResolvedColorValue('surface-card'), // #131316
  ];

  const palette = {
    color1: solid(getResolvedColorValue('accent-info')), // blue
    color2: greyShades, // grey
    color3: solid(getResolvedColorValue('negative')), // red
    color4: solid(getResolvedColorValue('positive')), // green
    color5: solid(getResolvedColorValue('accent-warning')), // orange
    color7: solid(getResolvedColorValue('warning')), // yellow
    white: getResolvedColorValue('text-primary'),
    black: getResolvedColorValue('background'),
    // `color6` (purple) deliberately absent — TV falls back to its built-in palette since we have no purple in our palette.
  } as CustomThemeColors;

  // We only ship `nadoDark` today, so both slots use the same palette. When a
  // light theme is added, branch on the active theme here.
  return { light: palette, dark: palette };
}
