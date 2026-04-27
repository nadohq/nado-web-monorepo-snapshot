import { Icons, SecondaryButton } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

interface Props {
  isCopied: boolean;
  disabled: boolean;

  onTwitterClick(): void;

  onDownloadClick(): void;

  onCopyToClipboardClick(): void;
}

export function SocialSharingButtons({
  onTwitterClick,
  onDownloadClick,
  onCopyToClipboardClick,
  isCopied,
  disabled,
}: Props) {
  const { t } = useTranslation();

  const buttonClassNames = 'flex-1 py-3';
  return (
    <div className="flex gap-2">
      <SecondaryButton
        className={buttonClassNames}
        size="xs"
        onClick={onTwitterClick}
        startIcon={<Icons.XLogo />}
        disabled={disabled}
      >
        {t(($) => $.buttons.post)}
      </SecondaryButton>
      <SecondaryButton
        className={buttonClassNames}
        size="xs"
        onClick={onDownloadClick}
        startIcon={<Icons.DownloadSimple />}
        disabled={disabled}
      >
        {t(($) => $.buttons.download)}
      </SecondaryButton>
      <SecondaryButton
        className={buttonClassNames}
        size="xs"
        onClick={onCopyToClipboardClick}
        startIcon={<Icons.Copy />}
        disabled={disabled}
      >
        {isCopied ? t(($) => $.buttons.copied) : t(($) => $.buttons.copy)}
      </SecondaryButton>
    </div>
  );
}
