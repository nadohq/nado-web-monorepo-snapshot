import { WithChildren } from '@nadohq/web-common';
import { AppPage } from 'client/modules/app/AppPage';
import { PortfolioChartGradientDefinitions } from 'client/pages/Portfolio/charts/components/PortfolioChartGradientDefinitions';
import { PortfolioNavigationLinks } from 'client/pages/Portfolio/components/PortfolioNavigationLinks';
import { PortfolioTopBar } from 'client/pages/Portfolio/components/PortfolioTopBar';

export default function PortfolioLayout({ children }: WithChildren) {
  return (
    <AppPage.Content
      // Full-width content on mobile
      className="px-0"
    >
      <PortfolioTopBar />
      <PortfolioNavigationLinks />
      <div className="flex flex-col gap-y-1">{children}</div>
      <PortfolioChartGradientDefinitions />
    </AppPage.Content>
  );
}
