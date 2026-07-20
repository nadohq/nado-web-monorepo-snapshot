import { useQueryCountryCode } from '@nadohq/react-client';
import { TRADING_COMP_RESTRICTED_COUNTRY_CODES } from 'client/modules/tradingCompetition/consts';

interface TradingCompRegionAccess {
  isRestricted: boolean;
  isLoading: boolean;
}

/**
 * Determines whether the current visitor is permitted to access the trading
 * competition based on the country code reported by the gateway. The gateway
 * returns `null` for environments where the header is not present (e.g. local
 * dev) — in that case we treat the visitor as allowed.
 */
export function useTradingCompRegionAccess(): TradingCompRegionAccess {
  const { data: countryCode, isLoading: isCountryCodeLoading } =
    useQueryCountryCode();

  const isRestricted =
    !!countryCode &&
    TRADING_COMP_RESTRICTED_COUNTRY_CODES.includes(countryCode.toUpperCase());

  return {
    isRestricted,
    isLoading: isCountryCodeLoading,
  };
}
