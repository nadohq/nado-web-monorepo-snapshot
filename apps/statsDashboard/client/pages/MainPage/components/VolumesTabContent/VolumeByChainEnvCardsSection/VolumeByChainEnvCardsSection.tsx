import { ChainEnv } from '@nadohq/client';
import {
  CustomNumberFormatSpecifier,
  formatNumber,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { Card, Value } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { useVolumeByChainEnvCardsSectionData } from 'client/pages/MainPage/components/VolumesTabContent/VolumeByChainEnvCardsSection/useVolumeByChainEnvCardsSectionData';
import Image from 'next/image';

export function VolumeByChainEnvCardsSection() {
  const { data } = useVolumeByChainEnvCardsSectionData();

  return (
    // Add pb to ensure a gap between the scrollbar and the content
    <div className="flex gap-6 overflow-x-auto pb-2">
      {data.map(({ chainEnv, totalVolume24hUsd, totalVolumeAllTimeUsd }) => (
        <ChainEnvVolumesCard
          key={chainEnv}
          chainEnv={chainEnv}
          totalVolume24hUsd={totalVolume24hUsd}
          totalVolumeAllTimeUsd={totalVolumeAllTimeUsd}
        />
      ))}
    </div>
  );
}

function ChainEnvVolumesCard({
  chainEnv,
  totalVolume24hUsd,
  totalVolumeAllTimeUsd,
}: {
  chainEnv: ChainEnv;
  totalVolume24hUsd: BigNumber | undefined;
  totalVolumeAllTimeUsd: BigNumber | undefined;
}) {
  const { getChainEnvMetadata } = useNadoMetadataContext();

  const { chainName, chainIcon } = getChainEnvMetadata(chainEnv);

  const formattedTotalVolume24hUsd = formatNumber(totalVolume24hUsd, {
    formatSpecifier: CustomNumberFormatSpecifier.CURRENCY_LARGE_ABBREVIATED,
  });
  const formattedTotalVolumeAllTimeUsd = formatNumber(totalVolumeAllTimeUsd, {
    formatSpecifier: CustomNumberFormatSpecifier.CURRENCY_LARGE_ABBREVIATED,
  });

  return (
    <Card className="flex min-w-64 flex-col gap-y-4 p-6">
      <div className="text-sm">
        <div className="flex items-center gap-x-1">
          <Image src={chainIcon} className="h-4 w-4" alt="" />
          <div className="text-text-primary font-semibold">{chainName}</div>
        </div>
        <div className="text-text-secondary font-medium">24h / Total Vol</div>
      </div>
      <Value className="font-semibold" sizeVariant="xl">
        {formattedTotalVolume24hUsd}
        <span className="text-stroke"> / </span>
        {formattedTotalVolumeAllTimeUsd}
      </Value>
    </Card>
  );
}
