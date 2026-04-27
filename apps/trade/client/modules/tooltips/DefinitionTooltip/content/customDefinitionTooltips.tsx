import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { DiscList, LinkButton } from '@nadohq/web-ui';
import { CustomDefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';
import { DefinitionTooltipContent } from 'client/modules/tooltips/DefinitionTooltip/types';
import { TWAP_RANDOMNESS_FRACTION } from 'client/modules/trading/components/twap/consts';
import { LINKS } from 'common/brandMetadata/links';
import type { TFunction } from 'i18next';
import Link from 'next/link';
import { Trans } from 'react-i18next';

interface CustomDefinitionTooltipVariables {
  primaryQuoteTokenSymbol: string;
}

export function customDefinitionTooltips(
  tFunction: TFunction,
  vars: CustomDefinitionTooltipVariables,
): Record<CustomDefinitionTooltipID, () => DefinitionTooltipContent> {
  // override t function to repeatedly passing variables
  const t = (
    selector: Parameters<typeof tFunction>[0],
    args: any = undefined,
  ) => tFunction(selector, { ...vars, ...args });

  return {
    realizedPnl: () => {
      return {
        title: t(($) => $.definitions.custom.realizedPnl.title),
        content: (
          <>
            <p>{t(($) => $.definitions.custom.realizedPnl.part1)}</p>
            <p>{t(($) => $.definitions.custom.realizedPnl.part2)}</p>
          </>
        ),
      };
    },
    marginUsageInitial: () => {
      return {
        title: t(($) => $.definitions.custom.marginUsageInitial.title),
        content: (
          <>
            <p>{t(($) => $.definitions.custom.marginUsageInitial.part1)}</p>
            <p>{t(($) => $.definitions.custom.marginUsageInitial.part2)}</p>
            <p>{t(($) => $.definitions.custom.marginUsageInitial.part3)}</p>
          </>
        ),
      };
    },
    availableMargin: () => {
      return {
        title: (
          <>
            <p>{t(($) => $.definitions.custom.availableMargin.title)}</p>
            <p>{t(($) => $.definitions.custom.availableMargin.subtitle)}</p>
          </>
        ),
        content: t(($) => $.definitions.custom.availableMargin.description),
      };
    },
    feeTier: () => {
      return {
        title: t(($) => $.definitions.custom.feeTier.title),
        content: (
          <>
            <p>{t(($) => $.definitions.custom.feeTier.description)}</p>
            <DiscList.Container>
              <DiscList.Item>
                {t(($) => $.definitions.custom.feeTier.makerFee)}
              </DiscList.Item>
              <DiscList.Item>
                {t(($) => $.definitions.custom.feeTier.takerFee)}
              </DiscList.Item>
            </DiscList.Container>
            <LinkButton
              className="w-max"
              href={LINKS.feeTiersDocs}
              external
              as={Link}
              colorVariant="secondary"
            >
              {t(($) => $.definitions.custom.feeTier.seeAllFeeTiers)}
            </LinkButton>
          </>
        ),
      };
    },
    perpPositionsMargin: () => {
      return {
        title: t(($) => $.definitions.custom.perpPositionsMargin.title),
        content: (
          <>
            <p>
              <Trans
                i18nKey={($) => $.definitions.custom.perpPositionsMargin.cross}
                values={vars}
                components={{
                  highlight: <span className="text-text-primary" />,
                }}
              />
            </p>
            <p>
              <Trans
                i18nKey={($) =>
                  $.definitions.custom.perpPositionsMargin.isolated
                }
                values={vars}
                components={{
                  highlight: <span className="text-text-primary" />,
                }}
              />
            </p>
          </>
        ),
      };
    },

    perpPositionsEstimatedLiqPrice: () => {
      return {
        title: t(
          ($) => $.definitions.custom.perpPositionsEstimatedLiqPrice.title,
        ),
        content: (
          <>
            <p>
              {t(
                ($) =>
                  $.definitions.custom.perpPositionsEstimatedLiqPrice
                    .description,
              )}
            </p>
            <p>
              {t(
                ($) =>
                  $.definitions.custom.perpPositionsEstimatedLiqPrice
                    .multiplePositionsNotice,
              )}
            </p>
          </>
        ),
      };
    },

    perpPositionsTpSl: () => {
      return {
        title: t(($) => $.definitions.custom.perpPositionsTpSl.title),
        content: (
          <DiscList.Container>
            <DiscList.Item>
              {t(
                ($) =>
                  $.definitions.custom.perpPositionsTpSl
                    .oneClickTradingRequired,
              )}
            </DiscList.Item>
            <DiscList.Item>
              {t(($) => $.definitions.custom.perpPositionsTpSl.reduceOnly)}
            </DiscList.Item>
            <DiscList.Item>
              {t(($) => $.definitions.custom.perpPositionsTpSl.ioc)}
            </DiscList.Item>
            <DiscList.Item>
              {t(
                ($) =>
                  $.definitions.custom.perpPositionsTpSl.executionNotGuaranteed,
              )}
            </DiscList.Item>
          </DiscList.Container>
        ),
      };
    },

    interestPayment: () => {
      return {
        title: t(($) => $.definitions.custom.interestPayment.title),
        content: (
          <div className="flex flex-col gap-y-2">
            <div>
              {t(($) => $.definitions.custom.interestPayment.description)}
            </div>
            <DiscList.Container>
              <DiscList.Item>
                {t(($) => $.definitions.custom.interestPayment.positive)}
              </DiscList.Item>
              <DiscList.Item>
                {t(($) => $.definitions.custom.interestPayment.negative)}
              </DiscList.Item>
            </DiscList.Container>
            <div>{t(($) => $.definitions.custom.interestPayment.formula)}</div>
            <div>
              {t(($) => $.definitions.custom.interestPayment.underlyingAsset)}
            </div>
          </div>
        ),
      };
    },

    marginManagerPerpPositionsUnsettled: () => {
      return {
        title: t(
          ($) => $.definitions.custom.marginManagerPerpPositionsUnsettled.title,
        ),
        content: (
          <>
            <p>
              {t(
                ($) =>
                  $.definitions.custom.marginManagerPerpPositionsUnsettled
                    .description,
              )}
            </p>
            <DiscList.Container>
              <DiscList.Item>
                <Trans
                  i18nKey={($) =>
                    $.definitions.custom.marginManagerPerpPositionsUnsettled
                      .positive
                  }
                  values={vars}
                  components={{
                    highlight: <span className="text-text-primary" />,
                  }}
                />
              </DiscList.Item>
              <DiscList.Item>
                <Trans
                  i18nKey={($) =>
                    $.definitions.custom.marginManagerPerpPositionsUnsettled
                      .negative
                  }
                  values={vars}
                  components={{
                    highlight: <span className="text-text-primary" />,
                  }}
                />
              </DiscList.Item>
            </DiscList.Container>
          </>
        ),
      };
    },

    settlement: () => {
      return {
        title: t(($) => $.definitions.custom.settlement.title),
        content: (
          <>
            <p>{t(($) => $.definitions.custom.settlement.description)}</p>
            <DiscList.Container>
              <DiscList.Item>
                <Trans
                  i18nKey={($) => $.definitions.custom.settlement.positive}
                  values={vars}
                  components={{
                    highlight: <span className="text-text-primary" />,
                  }}
                />
              </DiscList.Item>
              <DiscList.Item>
                <Trans
                  i18nKey={($) => $.definitions.custom.settlement.negative}
                  values={vars}
                  components={{
                    highlight: <span className="text-text-primary" />,
                  }}
                />
              </DiscList.Item>
            </DiscList.Container>
          </>
        ),
      };
    },

    liquidationType: () => {
      return {
        title: t(($) => $.definitions.custom.liquidationType.title),
        content: (
          <>
            <p>{t(($) => $.definitions.custom.liquidationType.prologue)}</p>
            <div>
              <span className="label-separator">
                {t(($) => $.definitions.custom.liquidationType.types)}
              </span>
              <DiscList.Container>
                <DiscList.Item>
                  {t(($) => $.definitions.custom.liquidationType.perp)}
                </DiscList.Item>
                <DiscList.Item>
                  {t(($) => $.definitions.custom.liquidationType.spot)}
                </DiscList.Item>
                <DiscList.Item>
                  {t(($) => $.definitions.custom.liquidationType.combination)}
                </DiscList.Item>
              </DiscList.Container>
            </div>
            <p>{t(($) => $.definitions.custom.liquidationType.epilogue)}</p>
          </>
        ),
      };
    },

    repayConvertMaxRepay: () => {
      return {
        title: t(($) => $.definitions.custom.repayConvertMaxRepay.title),
        content: (
          <>
            <p>{t(($) => $.definitions.custom.repayConvertMaxRepay.part1)}</p>
            <p>{t(($) => $.definitions.custom.repayConvertMaxRepay.part2)}</p>
            <p>{t(($) => $.definitions.custom.repayConvertMaxRepay.part3)}</p>
          </>
        ),
      };
    },

    marginManagerSizeOfSpread: () => {
      return {
        title: t(($) => $.definitions.custom.marginManagerSizeOfSpread.title),
        content: (
          <>
            <div>
              {t(($) => $.definitions.custom.marginManagerSizeOfSpread.part1)}
            </div>
            <div>
              {t(($) => $.definitions.custom.marginManagerSizeOfSpread.part2)}
            </div>
          </>
        ),
      };
    },

    marginManagerSpotPortionOfSpread: () => {
      return {
        title: t(
          ($) => $.definitions.custom.marginManagerSpotPortionOfSpread.title,
        ),
        content: (
          <>
            <div>
              {t(
                ($) =>
                  $.definitions.custom.marginManagerSpotPortionOfSpread.part1,
              )}
            </div>
            <div>
              {t(
                ($) =>
                  $.definitions.custom.marginManagerSpotPortionOfSpread.part2,
              )}
            </div>
          </>
        ),
      };
    },

    marginManagerPerpPortionOfSpread: () => {
      return {
        title: t(
          ($) => $.definitions.custom.marginManagerPerpPortionOfSpread.title,
        ),
        content: (
          <>
            <div>
              {t(
                ($) =>
                  $.definitions.custom.marginManagerPerpPortionOfSpread.part1,
              )}
            </div>
            <div>
              {t(
                ($) =>
                  $.definitions.custom.marginManagerPerpPortionOfSpread.part2,
              )}
            </div>
          </>
        ),
      };
    },

    marginManagerBalancesMarginCalc: () => {
      return {
        title: t(
          ($) => $.definitions.custom.marginManagerBalancesMarginCalc.title,
        ),
        content: (
          <div className="flex flex-col gap-y-2">
            {t(
              ($) =>
                $.definitions.custom.marginManagerBalancesMarginCalc.legend,
            )}
            <DiscList.Container>
              <DiscList.Item>
                {t(
                  ($) =>
                    $.definitions.custom.marginManagerBalancesMarginCalc
                      .positiveBalance,
                )}
              </DiscList.Item>
              <DiscList.Item>
                {t(
                  ($) =>
                    $.definitions.custom.marginManagerBalancesMarginCalc
                      .negativeBalance,
                )}
              </DiscList.Item>
            </DiscList.Container>
            <div>
              {t(
                ($) =>
                  $.definitions.custom.marginManagerBalancesMarginCalc
                    .valueDeterminedUsingOraclePrice,
              )}
            </div>
          </div>
        ),
      };
    },

    marginManagerPerpCrossMarginCalc: () => {
      return {
        title: t(
          ($) => $.definitions.custom.marginManagerPerpCrossMarginCalc.title,
        ),
        content: (
          <div className="flex flex-col gap-y-2">
            {t(
              ($) =>
                $.definitions.custom.marginManagerPerpCrossMarginCalc.legend,
            )}
            <DiscList.Container>
              <DiscList.Item>
                {t(
                  ($) =>
                    $.definitions.custom.marginManagerPerpCrossMarginCalc.long,
                )}
              </DiscList.Item>
              <DiscList.Item>
                {t(
                  ($) =>
                    $.definitions.custom.marginManagerPerpCrossMarginCalc.short,
                )}
              </DiscList.Item>
            </DiscList.Container>
            <p>
              {t(
                ($) =>
                  $.definitions.custom.marginManagerPerpCrossMarginCalc
                    .amountAbsoluteSizeOfPosition,
              )}
            </p>
          </div>
        ),
      };
    },

    marginManagerSpreadMarginCalc: () => {
      return {
        title: t(
          ($) => $.definitions.custom.marginManagerSpreadMarginCalc.title,
        ),
        content: (
          <div className="flex flex-col gap-y-2">
            <div>
              {t(
                ($) =>
                  $.definitions.custom.marginManagerSpreadMarginCalc
                    .description,
              )}
            </div>
            <div>
              <Trans
                i18nKey={($) =>
                  $.definitions.custom.marginManagerSpreadMarginCalc.learnMore
                }
                values={vars}
                components={{
                  link: (
                    <LinkButton
                      href={LINKS.spreadDocs}
                      external
                      as={Link}
                      colorVariant="secondary"
                    />
                  ),
                }}
              />
            </div>
          </div>
        ),
      };
    },

    funding1h: () => {
      return {
        title: t(($) => $.definitions.custom.funding1h.title),
        content: (
          <>
            <p>{t(($) => $.definitions.custom.funding1h.description)}</p>
            <p>{t(($) => $.definitions.custom.funding1h.details)}</p>
            <DiscList.Container>
              <DiscList.Item>
                {t(($) => $.definitions.custom.funding1h.positive)}
              </DiscList.Item>
              <DiscList.Item>
                {t(($) => $.definitions.custom.funding1h.negative)}
              </DiscList.Item>
            </DiscList.Container>
            <p>{t(($) => $.definitions.custom.funding1h.formula)}</p>
          </>
        ),
      };
    },

    tradingTwapRandomOrder: () => {
      return {
        title: t(($) => $.definitions.custom.tradingTwapRandomOrder.title),
        content: t(
          ($) => $.definitions.custom.tradingTwapRandomOrder.description,
          {
            randomnessFraction: formatNumber(TWAP_RANDOMNESS_FRACTION, {
              formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_INT,
            }),
          },
        ),
      };
    },

    tradingTimeInForce: () => {
      return {
        title: t(($) => $.definitions.custom.tradingTimeInForce.title),
        content: (
          <>
            <DiscList.Container>
              <DiscList.Item>
                {t(($) => $.definitions.custom.tradingTimeInForce.gtc)}
              </DiscList.Item>
              <DiscList.Item>
                {t(($) => $.definitions.custom.tradingTimeInForce.ioc)}
              </DiscList.Item>
              <DiscList.Item>
                {t(($) => $.definitions.custom.tradingTimeInForce.fok)}
              </DiscList.Item>
              <DiscList.Item>
                {t(($) => $.definitions.custom.tradingTimeInForce.goodUntil)}
              </DiscList.Item>
            </DiscList.Container>
          </>
        ),
      };
    },
  };
}
