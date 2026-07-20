import { TradingCompTrackCard } from 'client/pages/TradingCompetition/components/TradingCompTrackCards/TradingCompTrackCard';
import { useTradingCompCards } from 'client/pages/TradingCompetition/components/TradingCompTrackCards/useTradingCompTrackCards';

export function TradingCompTrackCards() {
  const { mappedTrackCards } = useTradingCompCards();

  return (
    <div className="grid gap-1 lg:grid-cols-2">
      {mappedTrackCards.map(
        ({
          track,
          status,
          accountValueThresholdUsd,
          volumeThresholdUsd,
          metricValue,
          rank,
        }) => (
          <TradingCompTrackCard
            key={track.type}
            track={track}
            status={status}
            accountValueThresholdUsd={accountValueThresholdUsd}
            volumeThresholdUsd={volumeThresholdUsd}
            metricValue={metricValue}
            rank={rank}
          />
        ),
      )}
    </div>
  );
}
