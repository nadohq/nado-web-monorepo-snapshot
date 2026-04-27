import { useNadoMetadataContext } from '@nadohq/react-client';
import { DropdownUi, Icons, useIsMobile } from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useUserStateError } from 'client/hooks/subaccount/useUserStateError';
import { AccountDropdownContent } from 'client/modules/app/navBar/accountInfo/AccountDropdownContent';
import { WalletDisplayName } from 'client/modules/app/navBar/accountInfo/components/WalletDisplayName';
import { NavPopoverContentContainer } from 'client/modules/app/navBar/components/NavPopoverContentContainer';
import Image from 'next/image';
import { useState } from 'react';

export function NavbarAccountDropdown() {
  const [open, setOpen] = useState(false);
  const { primaryChainEnvMetadata } = useNadoMetadataContext();
  const isMobile = useIsMobile();
  const userStateError = useUserStateError();

  return (
    <DropdownMenu.Root onOpenChange={setOpen} open={open}>
      <DropdownMenu.Trigger asChild>
        <DropdownUi.Trigger
          borderRadiusVariant="sm"
          className="text-text-primary justify-center p-2"
          open={open}
        >
          {userStateError === 'incorrect_connected_chain' ? (
            <Icons.Warning className="text-warning h-4 w-auto" />
          ) : (
            <Image
              alt={primaryChainEnvMetadata.chainName}
              src={primaryChainEnvMetadata.chainIcon}
              className="h-4 w-auto"
            />
          )}
          <WalletDisplayName />
        </DropdownUi.Trigger>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        asChild
        align={'end'}
        alignOffset={isMobile ? -64 : -20}
        sideOffset={8}
      >
        <NavPopoverContentContainer className="w-72 px-1 pt-3 pb-2">
          <AccountDropdownContent />
        </NavPopoverContentContainer>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
