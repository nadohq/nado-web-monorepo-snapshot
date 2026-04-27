import {
  ToastBodyProps,
  ToastHeaderProps,
  ToastSeparatorProps,
} from 'client/components/Toast/types';
import { ElementType } from 'react';

type ActionToastVariant = 'success' | 'failure' | 'pending';

export interface ActionToastHeaderProps extends ToastHeaderProps {
  variant: ActionToastVariant;
  icon?: ElementType<{
    fill: string;
    size: number;
  }>;
}

export interface ActionToastSeparatorProps extends ToastSeparatorProps {
  variant: ActionToastVariant;
}

export interface ActionToastBodyProps extends ToastBodyProps {
  variant: ActionToastVariant;
}
