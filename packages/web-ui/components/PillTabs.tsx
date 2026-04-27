import { joinClassNames, WithChildren, WithRef } from '@nadohq/web-common';
import { ComponentPropsWithRef } from 'react';
import {
  STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME,
  TabButtonProps,
  TabTextButton,
} from './Button';
import { CARD_PADDING_CLASSNAMES } from './Card';

function Button({
  id,
  active,
  children,
  dataTestId,
  ...rest
}: WithChildren<TabButtonProps>) {
  return (
    <TabTextButton
      id={id}
      className={joinClassNames(
        'gap-x-0.5 rounded-sm p-1 text-xs',
        active && 'bg-surface-1',
      )}
      active={active ?? false}
      dataTestId={dataTestId}
      {...rest}
    >
      {children}
    </TabTextButton>
  );
}

function TabsList({
  children,
  ...rest
}: WithChildren & WithRef<ComponentPropsWithRef<'div'>, HTMLDivElement>) {
  return (
    <div
      className={joinClassNames(
        'flex gap-x-3',
        STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME['sm'],
        CARD_PADDING_CLASSNAMES.horizontal,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export const PillTabs = {
  Button,
  TabsList,
};
