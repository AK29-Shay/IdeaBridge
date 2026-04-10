/**
 * notificationController.ts
 * Thin layer for notification read/mark operations.
 */
import {
  getNotificationsByUser,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notificationService'
import type { DbNotification } from '../models/types'

export async function fetchNotifications(user_id: string): Promise<DbNotification[]> {
  return getNotificationsByUser(user_id)
}

export async function markRead(
  notification_id: string,
  user_id: string
): Promise<DbNotification> {
  return markNotificationRead(notification_id, user_id)
}

export async function markAllRead(user_id: string): Promise<void> {
  return markAllNotificationsRead(user_id)
}
