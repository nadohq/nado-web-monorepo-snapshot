import { useEVMContext, useNadoMetadataContext } from '@nadohq/react-client';
import { DropdownUi, UpDownChevronIcon } from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SwitcherDropdownItemButton } from 'client/components/SwitcherDropdownItemButton';
import { CHAIN_ENV_SWITCHER_OPTIONS } from 'client/modules/envSpecificContent/consts/chainEnvSwitcherOptions';
import Image from 'next/image';
import { useState } from 'react';

export function ConnectWalletChainEnvSwitcherDropdown() {
  const { primaryChainEnv, setPrimaryChainEnv } = useEVMContext();
  const {
    primaryChainEnvMetadata: { chainIcon: primaryChainEnvIcon },
    getChainEnvMetadata,
  } = useNadoMetadataContext();

  const [open, setIsOpen] = useState(false);

  const labelForPrimaryChainEnv =
    CHAIN_ENV_SWITCHER_OPTIONS.find(
      (option) => option.chainEnv === primaryChainEnv,
    )?.label ?? '';

  return (
    <DropdownMenu.Root open={open} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <DropdownUi.Trigger
          endIcon={<UpDownChevronIcon open={open} size={12} />}
          open={open}
        >
          <div className="flex items-center gap-x-1">
            <Image
              src={primaryChainEnvIcon}
              alt={labelForPrimaryChainEnv}
              className="h-4 w-auto"
            />
            {labelForPrimaryChainEnv}
          </div>
        </DropdownUi.Trigger>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content sideOffset={8} align="end" asChild>
        <DropdownUi.Content className="min-w-32">
          {CHAIN_ENV_SWITCHER_OPTIONS.map((option) => {
            const isActive = option.chainEnv === primaryChainEnv;
            const { chainIcon } = getChainEnvMetadata(option.chainEnv);

            return (
              <SwitcherDropdownItemButton
                key={option.chainEnv}
                className="px-1 py-0.5"
                labelContainerClassName="text-xs"
                startIcon={
                  <Image src={chainIcon} alt="" className="h-auto w-3.5" />
                }
                label={option.label}
                active={isActive}
                onClick={() => {
                  if (!isActive) {
                    setPrimaryChainEnv(option.chainEnv);
                  }
                }}
              />
            );
          })}
        </DropdownUi.Content>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
