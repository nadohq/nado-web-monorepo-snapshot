import { ReactNode } from 'react';
import { DistributedOmit } from 'type-fest';
import { IconComponent } from '../../Icons';
import { CardButtonBaseProps } from './CardButton';

export type NavCardBaseProps = DistributedOmit<
  CardButtonBaseProps,
  'startIcon' | 'endIcon' | 'title'
> & {
  title: ReactNode;
  icon?: IconComponent;
  contentClassName?: string;
  description?: ReactNode;
};
