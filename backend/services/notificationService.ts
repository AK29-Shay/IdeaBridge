import supabaseServer from '../config/supabaseServer'

export async function createNotification(payload: any) {
  const { data, error } = await supabaseServer.from('notifications').insert(payload).select()
  if (error) throw error
  return data?.[0]
}

export async function markNotificationRead(notificationId: string) {
  const { data, error } = await supabaseServer
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
  if (error) throw error
  return data?.[0]
}
