import { joinClassNames, mergeClassNames } from '@nadohq/web-common';
import { Button, getStateOverlayClassNames } from '@nadohq/web-ui';
import { ValueWithLabelProps } from 'client/components/ValueWithLabel/types';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import Link from 'next/link';

type Props = ValueWithLabelProps & {
  valueWithLabelClassName?: string;
  href?: string;
  onClick?: () => void;
};

export function MarketsCardItemButton({
  href,
  onClick,
  className,
  sizeVariant,
  valueWithLabelClassName,
  labelClassName,
  ...rest
}: Props) {
  const hoverStateOverlayClassName = getStateOverlayClassNames({
    borderRadiusVariant: 'sm',
  });

  const isInteractive = !!href || !!onClick;

  const buttonClassNames = joinClassNames(
    'h-max items-center justify-stretch p-2',
    // Only show the hover affordance when there's an action wired up, so the
    // card doesn't look clickable while its trading link is still resolving.
    isInteractive && hoverStateOverlayClassName,
    className,
  );

  const valueWithLabelProps: ValueWithLabelProps = {
    className: mergeClassNames(
      'flex-1 flex-col sm:flex-row items-stretch',
      valueWithLabelClassName,
    ),
    labelClassName: joinClassNames('text-text-primary', labelClassName),
    sizeVariant: sizeVariant ?? 'xs',
    ...rest,
  };

  const content = <ValueWithLabel.Horizontal {...valueWithLabelProps} />;

  if (href) {
    return (
      <Button className={buttonClassNames} as={Link} href={href}>
        {content}
      </Button>
    );
  }

  if (onClick) {
    return (
      <Button className={buttonClassNames} onClick={onClick}>
        {content}
      </Button>
    );
  }

  // No action wired up yet (eg. trading links still loading) — render a
  // non-interactive element so clicks aren't silently swallowed.
  return (
    <Button className={buttonClassNames} as="div">
      {content}
    </Button>
  );
}
