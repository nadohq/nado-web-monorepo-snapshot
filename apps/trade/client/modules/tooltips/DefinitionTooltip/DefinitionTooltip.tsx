'use client';

import { useNadoMetadataContext } from '@nadohq/react-client';
import { BaseTestProps } from '@nadohq/web-common';
import {
  BaseDefinitionTooltip,
  BaseDefinitionTooltipDecoration,
  BaseDefinitionTooltipProps,
  ConditionalAsChild,
} from '@nadohq/web-ui';
import { customDefinitionTooltips } from 'client/modules/tooltips/DefinitionTooltip/content/customDefinitionTooltips';
import {
  CustomDefinitionTooltipID,
  DefinitionTooltipID,
  SimpleDefinitionTooltipID,
} from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';
import { DefinitionTooltipContent } from 'client/modules/tooltips/DefinitionTooltip/types';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props
  extends
    BaseTestProps,
    Pick<
      BaseDefinitionTooltipProps,
      'contentWrapperClassName' | 'tooltipOptions' | 'asChild' | 'noHelpCursor'
    > {
  /**
   * This is optional as there are many usecases where we may or may not show a tooltip in an array-based rendering pattern.
   * If this is not specified, no tooltip is rendered and children are returned as-is.
   */
  definitionId?: DefinitionTooltipID;
  children?: ReactNode;
  /** Additional decorations, such as an underline or info icon, to apply to the tooltip*/
  decoration?: BaseDefinitionTooltipDecoration;
}

export function DefinitionTooltip({
  definitionId,
  tooltipOptions,
  contentWrapperClassName,
  children,
  decoration = 'underline',
  asChild,
  noHelpCursor,
  dataTestId,
}: Props) {
  const { t } = useTranslation();
  const {
    primaryQuoteToken: { symbol: primaryQuoteTokenSymbol },
  } = useNadoMetadataContext();

  const tooltipConfig: DefinitionTooltipContent | null = useMemo(() => {
    if (!definitionId) {
      return null;
    }

    const customTooltips = customDefinitionTooltips(t, {
      primaryQuoteTokenSymbol,
    });

    if (definitionId in customTooltips) {
      const customDefinitionId = definitionId as CustomDefinitionTooltipID;
      return customTooltips[customDefinitionId]();
    }

    const simpleDefinitionId = definitionId as SimpleDefinitionTooltipID;
    return {
      title: t(($) => $.definitions[simpleDefinitionId].title, {
        primaryQuoteTokenSymbol,
      }),
      content: t(($) => $.definitions[simpleDefinitionId].content, {
        primaryQuoteTokenSymbol,
      }),
    };
  }, [definitionId, t, primaryQuoteTokenSymbol]);

  if (!tooltipConfig) {
    return (
      <ConditionalAsChild
        asChild={asChild}
        fallback="div"
        // Apply contentWrapperClassName to ensure consistent behavior between when definitionId is specified and when it is not.
        className={contentWrapperClassName}
        dataTestId={dataTestId}
      >
        {children}
      </ConditionalAsChild>
    );
  }

  return (
    <BaseDefinitionTooltip
      contentWrapperClassName={contentWrapperClassName}
      title={tooltipConfig.title}
      content={tooltipConfig.content}
      tooltipOptions={{
        placement: 'auto-start',
        delayShow: 500,
        delayHide: 0,
        interactive: false,
        ...tooltipOptions,
      }}
      decoration={decoration}
      asChild={asChild}
      noHelpCursor={noHelpCursor}
      dataTestId={dataTestId}
    >
      {children}
    </BaseDefinitionTooltip>
  );
}
