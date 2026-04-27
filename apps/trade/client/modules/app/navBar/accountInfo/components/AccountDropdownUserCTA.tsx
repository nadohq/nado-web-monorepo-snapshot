import { PrimaryButton } from '@nadohq/web-ui';
import { useButtonUserStateErrorProps } from 'client/components/ValidUserStatePrimaryButton/useButtonUserStateErrorProps';

/**
 * Renders a CTA button for the most immediate action that a user needs to take to start trading on Nado
 */
export function AccountDropdownUserCTA() {
  const userStateErrorButtonProps = useButtonUserStateErrorProps({
    handledErrors: {
      not_connected: false,
      incorrect_connected_chain: true,
      incorrect_chain_env: false,
      requires_initial_deposit: true,
      requires_sign_once_approval: true,
      requires_single_signature_setup: true,
    },
  });

  if (!userStateErrorButtonProps) return null;

  return <PrimaryButton {...userStateErrorButtonProps} />;
}
