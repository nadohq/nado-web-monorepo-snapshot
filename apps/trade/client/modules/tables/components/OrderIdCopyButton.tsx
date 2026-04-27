import { useCopyText } from '@nadohq/web-common';
import {
  CopyIcon,
  LabelTooltip,
  TextButton,
  TextButtonProps,
} from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

const VISIBLE_CHARS = 5;

type ColorVariant = TextButtonProps['colorVariant'];

interface Props {
  orderId: string;
  colorVariant?: ColorVariant;
}

/**
 * Displays a truncated order ID with tooltip showing full ID and copy button
 */
export function OrderIdCopyButton({ orderId }: Props) {
  const { t } = useTranslation();
  const { isCopied, copy } = useCopyText();
  const truncatedId = orderId.slice(-VISIBLE_CHARS);

  const tooltipContent = isCopied ? (
    t(($) => $.buttons.copied)
  ) : (
    <>
      {orderId.slice(0, -VISIBLE_CHARS)}
      <span className="text-text-primary">{orderId.slice(-VISIBLE_CHARS)}</span>
    </>
  );

  return (
    <LabelTooltip
      label={tooltipContent}
      tooltipContainerClassName="break-all text-text-tertiary text-xs"
      asChild
      noHelpCursor
    >
      <TextButton onClick={() => copy(orderId)} colorVariant="primary">
        {truncatedId}
        <CopyIcon size={14} isCopied={isCopied} />
      </TextButton>
    </LabelTooltip>
  );
}
