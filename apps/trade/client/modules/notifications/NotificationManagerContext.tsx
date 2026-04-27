import { useRequiredContext } from '@nadohq/react-client';
import { DispatchNotificationParams } from 'client/modules/notifications/types';
import { createContext } from 'react';

export type NotificationManagerContextData = {
  dispatchNotification(params: DispatchNotificationParams): void;
};

export const NotificationManagerContext =
  createContext<NotificationManagerContextData | null>(null);

export const useNotificationManagerContext = () =>
  useRequiredContext(NotificationManagerContext);
