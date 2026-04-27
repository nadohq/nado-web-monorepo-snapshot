import { VolumeByChainEnvChartSection } from 'client/pages/MainPage/components/common/VolumeByChainEnvChartSection/VolumeByChainEnvChartSection';
import { EdgeSpotPerpVolumeChartsSection } from 'client/pages/MainPage/components/VolumesTabContent/EdgeSpotPerpVolumeChartsSection/EdgeSpotPerpVolumeChartsSection';
import { EdgeVolumePieChartsSection } from 'client/pages/MainPage/components/VolumesTabContent/EdgeVolumePieChartsSection/EdgeVolumePieChartsSection';

export function VolumesTabContent() {
  return (
    <>
      <VolumeByChainEnvChartSection />
      <EdgeVolumePieChartsSection />
      <EdgeSpotPerpVolumeChartsSection />
    </>
  );
}
