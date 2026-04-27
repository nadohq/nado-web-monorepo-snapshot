import { Icons, TextButton } from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { CustomizableTableType } from 'client/modules/tables/customizableTables/tableConfig';
import { useTranslation } from 'react-i18next';

interface Props {
  tableType: CustomizableTableType;
}

export function ColumnsSettingsButton({ tableType }: Props) {
  const { show } = useDialog();
  const { t } = useTranslation();

  return (
    <TextButton
      title={t(($) => $.columnSettings)}
      onClick={() => {
        show({
          type: 'customize_table_columns',
          params: {
            tableType,
          },
        });
      }}
      colorVariant="secondary"
    >
      <Icons.SlidersHorizontal size={18} />
    </TextButton>
  );
}
