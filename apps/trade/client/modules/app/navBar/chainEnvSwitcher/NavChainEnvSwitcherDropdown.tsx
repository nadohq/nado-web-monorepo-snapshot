import { useEVMContext, useNadoMetadataContext } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import {
  Icons,
  NavBarCardButton,
  PrimaryButton,
  Z_INDEX,
} from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SwitcherDropdownItemButton } from 'client/components/SwitcherDropdownItemButton';
import { NavPopoverContentContainer } from 'client/modules/app/navBar/components/NavPopoverContentContainer';
import { CHAIN_ENV_SWITCHER_OPTIONS } from 'client/modules/envSpecificContent/consts/chainEnvSwitcherOptions';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export function NavChainEnvSwitcherDropdown() {
  const { t } = useTranslation();
  const {
    primaryChainEnv,
    setPrimaryChainEnv,
    chainStatus: { isIncorrectChain },
    switchConnectedChain,
  } = useEVMContext();

  const {
    primaryChainEnvMetadata: { chainIcon, chainName },
    getChainEnvMetadata,
  } = useNadoMetadataContext();

  const triggerChainIcon = (
    <div className="relative">
      <Image src={chainIcon} alt={primaryChainEnv} className="h-5 w-auto" />
      {isIncorrectChain && (
        <Icons.ExclamationMark
          className="bg-warning-muted text-warning absolute -right-0.5 -bottom-0.5 rounded-full"
          size={12}
        />
      )}
    </div>
  );

  const switchConnectedChainCta = isIncorrectChain && (
    <DropdownMenu.Item asChild>
      <PrimaryButton
        onClick={() => {
          switchConnectedChain();
        }}
      >
        {t(($) => $.buttons.switchToChain, { chainName })}
      </PrimaryButton>
    </DropdownMenu.Item>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <NavBarCardButton className="data-[state=open]:bg-surface-2 aspect-square justify-center">
          {triggerChainIcon}
        </NavBarCardButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content sideOffset={8} align="end" asChild>
        <NavPopoverContentContainer
          className={joinClassNames(
            'flex min-w-[180px] flex-col gap-y-2 p-1 text-sm',
            Z_INDEX.popover,
          )}
        >
          {switchConnectedChainCta}
          {CHAIN_ENV_SWITCHER_OPTIONS.map((option) => {
            const isActive = option.chainEnv === primaryChainEnv;
            const { chainIcon } = getChainEnvMetadata(option.chainEnv);

            // Only show the extra UI when not active as there isn't space for the icon AND the active indicator
            // Change the condition below to show the new rewards promo when needed
            const showNewRewardsPromo = !isActive && false;

            const buttonLabel = showNewRewardsPromo ? (
              <div className="flex items-center gap-x-2">
                <span>{option.label}</span>
                <span className="text-accent text-3xs">
                  <Icons.Sparkle size={12} className="inline" />{' '}
                  {t(($) => $.newRewards)}
                </span>
              </div>
            ) : (
              option.label
            );

            return (
              <SwitcherDropdownItemButton
                key={option.chainEnv}
                startIcon={
                  <Image src={chainIcon} alt="" className="h-4 w-auto" />
                }
                label={buttonLabel}
                active={isActive}
                onClick={() => {
                  if (!isActive) {
                    setPrimaryChainEnv(option.chainEnv);
                  }
                }}
              />
            );
          })}
        </NavPopoverContentContainer>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
