import {
  BaseTestProps,
  joinClassNames,
  mergeClassNames,
  WithRef,
} from '@nadohq/web-common';
import {
  SelectItemProps as BaseSelectItemProps,
  SelectTriggerProps as BaseSelectTriggerProps,
  Root,
  SelectContent,
  SelectContentProps,
  SelectItem,
  SelectItemIndicator,
  SelectPortal,
  SelectTrigger,
  SelectViewport,
} from '@radix-ui/react-select';
import { ReactNode } from 'react';
import { Merge } from 'type-fest';
import { TextButton } from '../Button';
import {
  DropdownUi,
  DropdownUiItemProps,
  DropdownUiTriggerProps,
} from '../DropdownUi/DropdownUi';
import { Icons, UpDownChevronIcon } from '../Icons';
import { ScrollShadowsContainer } from '../ScrollShadowsContainer/ScrollShadowsContainer';

export type SelectTriggerProps = Omit<
  Merge<DropdownUiTriggerProps, BaseSelectTriggerProps>,
  'asChild'
>;

function Trigger({
  disabled,
  borderRadiusVariant,
  stateClassNameOverrides,
  endIcon,
  className,
  noDisabledOverlay,
  children,
  ...rest
}: WithRef<SelectTriggerProps, HTMLButtonElement>) {
  return (
    <SelectTrigger asChild {...rest}>
      <DropdownUi.Trigger
        noDisabledOverlay={noDisabledOverlay}
        className={mergeClassNames('bg-surface-1', className)}
        disabled={disabled}
        borderRadiusVariant={borderRadiusVariant}
        stateClassNameOverrides={stateClassNameOverrides}
        endIcon={endIcon}
      >
        {children}
      </DropdownUi.Trigger>
    </SelectTrigger>
  );
}

function PillTrigger({
  children,
  className,
  disabled,
  endIcon,
  stateClassNameOverrides,
  ...rest
}: WithRef<SelectTriggerProps, HTMLButtonElement>) {
  return (
    <SelectTrigger asChild {...rest}>
      <DropdownUi.PillTrigger
        className={className}
        disabled={disabled}
        stateClassNameOverrides={stateClassNameOverrides}
        endIcon={endIcon}
      >
        {children}
      </DropdownUi.PillTrigger>
    </SelectTrigger>
  );
}

export type SelectTextTriggerProps = Omit<SelectTriggerProps, 'asChild'>;

function TextTrigger({
  children,
  className,
  open,
  withChevron,
  ...rest
}: WithRef<SelectTextTriggerProps, HTMLButtonElement>) {
  return (
    <SelectTrigger asChild {...rest}>
      <TextButton
        className={joinClassNames('justify-between', className)}
        colorVariant="primary"
        endIcon={withChevron && <UpDownChevronIcon open={open ?? false} />}
      >
        {children}
      </TextButton>
    </SelectTrigger>
  );
}

export interface SelectOptionsProps extends SelectContentProps {
  header?: ReactNode;
  viewportClassName?: string;
}

function Options({
  children,
  header,
  className,
  position = 'popper',
  viewportClassName,
  ...rest
}: WithRef<SelectOptionsProps, HTMLDivElement>) {
  return (
    <SelectContent asChild position={position} sideOffset={5} {...rest}>
      <DropdownUi.Content
        header={header}
        className={joinClassNames(
          'min-w-(--radix-select-trigger-width) rounded-sm',
          className,
        )}
      >
        {/*Smaller shadow as selects are usually in smaller containers*/}
        <ScrollShadowsContainer asChild shadowSize={10}>
          <SelectViewport
            className={joinClassNames('flex flex-col', viewportClassName)}
          >
            {children}
          </SelectViewport>
        </ScrollShadowsContainer>
      </DropdownUi.Content>
    </SelectContent>
  );
}

export interface SelectOptionProps
  extends
    BaseTestProps,
    Omit<BaseSelectItemProps, 'asChild'>,
    Pick<DropdownUiItemProps, 'startIcon' | 'endIcon'> {
  selectionStartIcon?: ReactNode;
  selectionEndIcon?: ReactNode;
  withSelectedCheckmark?: boolean;
}

function Option({
  children,
  className,
  value,
  startIcon,
  endIcon,
  selectionStartIcon,
  selectionEndIcon,
  withSelectedCheckmark = true,
  disabled,
  dataTestId,
  ...rest
}: WithRef<SelectOptionProps, HTMLDivElement>) {
  const endIndicator = (() => {
    if (withSelectedCheckmark) {
      return <Icons.Check />;
    }
    return selectionEndIcon;
  })();

  return (
    <SelectItem
      asChild
      value={value}
      disabled={disabled}
      data-testid={dataTestId}
      {...rest}
    >
      <DropdownUi.Item
        className={className}
        startIcon={startIcon}
        endIcon={endIcon}
        disabled={disabled}
      >
        {selectionStartIcon && (
          <SelectItemIndicator>{selectionStartIcon}</SelectItemIndicator>
        )}
        {children}
        {endIndicator && (
          <SelectItemIndicator className="ml-auto">
            {endIndicator}
          </SelectItemIndicator>
        )}
      </DropdownUi.Item>
    </SelectItem>
  );
}

export const Select = {
  Root,
  UnstyledTrigger: SelectTrigger,
  TextTrigger,
  Trigger,
  PillTrigger,
  Options,
  Option,
  Portal: SelectPortal,
};
