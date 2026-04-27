import { Icons, TextButton } from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';

interface Props {
  digest: string;
}

/**
 * Button to open the TWAP executions dialog
 */
export function ViewTwapExecutionsButton({ digest }: Props) {
  const { show } = useDialog();

  return (
    <TextButton
      colorVariant="tertiary"
      onClick={() => show({ type: 'twap_executions', params: { digest } })}
      endIcon={<Icons.MagnifyingGlass size={14} />}
    />
  );
}
