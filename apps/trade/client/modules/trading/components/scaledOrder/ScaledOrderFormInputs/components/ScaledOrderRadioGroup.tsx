import {
  BaseTestProps,
  joinClassNames,
  WithChildren,
} from '@nadohq/web-common';
import { Icons, TabTextButton } from '@nadohq/web-ui';
import * as RadioGroup from '@radix-ui/react-radio-group';

interface RadioGroupButtonProps extends WithChildren, BaseTestProps {
  value: string;
  active: boolean;
}

function RadioGroupButton({
  value,
  active,
  children,
  dataTestId,
}: RadioGroupButtonProps) {
  const Icon = active ? <Icons.CheckCircleFill /> : <Icons.Circle />;

  return (
    <RadioGroup.Item value={value} asChild>
      <TabTextButton
        className="gap-x-1 text-xs"
        startIcon={Icon}
        active={active}
        dataTestId={dataTestId}
      >
        {children}
      </TabTextButton>
    </RadioGroup.Item>
  );
}

function RadioGroupRoot({
  className,
  value,
  onValueChange,
  children,
  ...rest
}: RadioGroup.RadioGroupProps) {
  return (
    <RadioGroup.Root
      className={joinClassNames('flex items-center gap-x-2', className)}
      value={value}
      onValueChange={onValueChange}
      {...rest}
    >
      {children}
    </RadioGroup.Root>
  );
}
export const ScaledOrderRadioGroup = {
  Button: RadioGroupButton,
  Root: RadioGroupRoot,
};
