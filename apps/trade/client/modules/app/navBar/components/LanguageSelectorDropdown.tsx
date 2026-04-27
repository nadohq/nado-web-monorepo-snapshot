import { I18N } from '@nadohq/i18n';
import { DropdownUi, Icons, TextButton } from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import i18n from 'common/i18n/i18n';

export function LanguageSelectorDropdown() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <TextButton
          className="p-2.5"
          colorVariant="secondary"
          startIcon={<Icons.GlobeSimple size={20} />}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild align="end" sideOffset={12}>
          <DropdownUi.Content className="flex min-w-32 flex-col gap-y-1 rounded-md">
            {I18N.languageSelector.map(({ code, label }) => {
              return (
                <DropdownMenu.Item key={code} asChild>
                  <DropdownUi.Item
                    className="p-2.5"
                    active={i18n.language === code}
                    onClick={() => i18n.changeLanguage(code)}
                  >
                    {label}
                  </DropdownUi.Item>
                </DropdownMenu.Item>
              );
            })}
          </DropdownUi.Content>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
