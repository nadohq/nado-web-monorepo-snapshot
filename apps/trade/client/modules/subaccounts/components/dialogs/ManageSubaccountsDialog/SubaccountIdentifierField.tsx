import { useCopyText } from '@nadohq/web-common';
import { CopyIcon, LabelTooltip, TextButton } from '@nadohq/web-ui';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useTranslation } from 'react-i18next';

interface SubaccountIdentifierFieldProps {
  label: string;
  value: string;
  valueClassName?: string;
}

/**
 * Displays a labeled subaccount identifier field with copy functionality
 */
export function SubaccountIdentifierField({
  label,
  value,
  valueClassName,
}: SubaccountIdentifierFieldProps) {
  const { t } = useTranslation();
  const { isCopied, copy } = useCopyText();

  return (
    <ValueWithLabel.Vertical
      sizeVariant="xs"
      label={label}
      labelClassName="label-separator"
      valueContent={
        <div className="flex items-center gap-x-2">
          <span className={valueClassName}>{value}</span>
          <LabelTooltip
            label={
              isCopied ? t(($) => $.buttons.copied) : t(($) => $.buttons.copy)
            }
            asChild
            noHelpCursor
          >
            <TextButton onClick={() => copy(value)} colorVariant="tertiary">
              <CopyIcon size={14} isCopied={isCopied} />
            </TextButton>
          </LabelTooltip>
        </div>
      }
    />
  );
}
