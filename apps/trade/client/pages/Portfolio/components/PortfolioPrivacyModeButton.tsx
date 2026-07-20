import { Icons, TextButton } from '@nadohq/web-ui';
import { usePrivacyMode } from 'client/modules/privacy/hooks/usePrivacyMode';

interface PortfolioPrivacyModeButtonProps {
  disabled: boolean | undefined;
}

export function PortfolioPrivacyModeButton({
  disabled,
}: PortfolioPrivacyModeButtonProps) {
  const { isPrivacyModeEnabled, setIsPrivacyModeEnabled } = usePrivacyMode();

  const Icon = isPrivacyModeEnabled ? Icons.EyeSlash : Icons.Eye;

  return (
    <TextButton
      className="p-2"
      colorVariant="tertiary"
      startIcon={<Icon size={16} />}
      disabled={disabled}
      dataTestId="portfolio-privacy-mode-button"
      onClick={() => {
        setIsPrivacyModeEnabled(!isPrivacyModeEnabled);
      }}
    />
  );
}
