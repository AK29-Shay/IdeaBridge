import { createNotification, markNotificationRead } from '../services/notificationService'

export async function notify(payload: any) {
  return createNotification(payload)
}

export async function readNotification(id: string) {
  return markNotificationRead(id)
}
