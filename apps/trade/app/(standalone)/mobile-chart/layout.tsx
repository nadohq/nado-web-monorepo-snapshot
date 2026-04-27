import { WithChildren } from '@nadohq/web-common';
import { MobileChartProviders } from 'client/modules/trading/mobileChart/MobileChartProviders';

import 'styles/globals.css';

export default function MobileChartLayout({ children }: WithChildren) {
  return (
    <html lang="en" data-theme="nadoDark">
      <body className="bg-surface-card">
        <MobileChartProviders>{children}</MobileChartProviders>
      </body>
    </html>
  );
}
