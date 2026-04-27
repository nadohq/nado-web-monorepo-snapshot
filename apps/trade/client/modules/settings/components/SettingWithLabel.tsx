import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { SETTINGS_ROW_HEIGHT } from 'client/modules/settings/consts';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';
import { ReactNode } from 'react';

interface Props extends WithClassnames {
  labelContent: ReactNode;
  controlContent: ReactNode;
  definitionId?: DefinitionTooltipID;
}

export function SettingWithLabel({
  controlContent,
  labelContent,
  definitionId,
  className,
}: Props) {
  return (
    <div
      className={joinClassNames(
        SETTINGS_ROW_HEIGHT,
        'flex items-center justify-between',
        className,
      )}
    >
      <DefinitionTooltip
        contentWrapperClassName="w-fit text-text-tertiary"
        definitionId={definitionId}
      >
        {labelContent}
      </DefinitionTooltip>
      {controlContent}
    </div>
  );
}
