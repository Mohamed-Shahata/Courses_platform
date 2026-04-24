import { NOTIFICATION_TYPE } from '../../../../generated/prisma/enums';

export interface ICreateNotification {
  userId: string;
  type: NOTIFICATION_TYPE;
  title: string;
  body: string;
  link?: string;
}

export interface INotificationFilter {
  userId: string;
  isRead?: boolean;
}
