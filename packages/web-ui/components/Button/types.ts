import { BaseTestProps } from '@nadohq/web-common';
import Link from 'next/link';
import { ComponentProps, ComponentPropsWithRef, ReactNode } from 'react';

interface SharedButtonProps extends BaseTestProps {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loadingIconSize?: number | string;
  disabled?: boolean;
  isLoading?: boolean;
}

export interface ButtonAsHTMLButtonProps
  extends ComponentPropsWithRef<'button'>, SharedButtonProps {
  as?: 'button';
}

export interface ButtonAsLinkProps
  extends Omit<ComponentPropsWithRef<typeof Link>, 'as'>, SharedButtonProps {
  as: typeof Link;
  href: ComponentProps<typeof Link>['href'];
  external?: boolean;
}

export interface ButtonAsDivProps
  extends ComponentPropsWithRef<'div'>, SharedButtonProps {
  as: 'div';
}

export type ButtonProps =
  | ButtonAsHTMLButtonProps
  | ButtonAsLinkProps
  | ButtonAsDivProps;
