import { NumberFormatSpecifier, NumberFormatValue } from '@nadohq/react-client';
import { BaseTestProps, WithClassnames } from '@nadohq/web-common';
import {
  BaseDefinitionTooltipProps,
  IconComponent,
  SizeVariant,
} from '@nadohq/web-ui';
import { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';
import { ReactNode } from 'react';

export interface ValueWithLabelSizeVariants {
  label: SizeVariant;
  value: SizeVariant;
}

interface SizeVariantProps {
  sizeVariant?: SizeVariant;
  sizeVariantOverrides?: Partial<ValueWithLabelSizeVariants>;
}

interface LabelContentProps extends SizeVariantProps {
  label: ReactNode;
  labelClassName?: string;
  labelStartIcon?: IconComponent;
  labelEndIcon?: IconComponent;
  labelIconClassName?: string;
  tooltip?: {
    id: DefinitionTooltipID;
    infoIcon?: true;
    options?: BaseDefinitionTooltipProps['tooltipOptions'];
  };
}

interface WithValueContent {
  valueContent: ReactNode;
  valueClassName?: string;
  valueEndElement?: ReactNode;
  isValuePrivate?: boolean;
}

interface WithFormatValue {
  value: NumberFormatValue | undefined | null;
  numberFormatSpecifier: NumberFormatSpecifier | string;
  defaultValue?: string | number;
  valueClassName?: string;
  valueEndElement?: ReactNode;
  /**
   * Null indicates a "non-value" as the new value, which will render a `-` instead of skipping render of the `-> newValue` entirely
   * This is useful for the estimated liquidation price, amongst other things.
   */
  newValue?: NumberFormatValue | null;
  /** When overriding icon size use `size-` className. ex. `size-4`  */
  changeArrowClassName?: string;
  isValuePrivate?: boolean;
}

export type ValueContentProps = (WithFormatValue | WithValueContent) &
  SizeVariantProps &
  BaseTestProps & {
    /** Callback when the value area is clicked. Adds cursor-pointer styling automatically. */
    onValueClick?: () => void;
  };

export type ValueWithLabelProps = WithClassnames<
  ValueContentProps & LabelContentProps & BaseTestProps
>;

export type HorizontalValueWithLabelProps = ValueWithLabelProps &
  BaseTestProps & {
    fitWidth?: boolean;
  };
