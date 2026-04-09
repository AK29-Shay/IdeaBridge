import supabaseServer from '../config/supabaseServer'

export async function createRequest(payload: any) {
  const { data, error } = await supabaseServer.from('requests').insert(payload).select()
  if (error) throw error
  return data?.[0]
}

export async function updateRequestStatus(request_id: string, status: string, actorId?: string) {
  // TODO: validate allowed transitions elsewhere
  const { data, error } = await supabaseServer
    .from('requests')
    .update({ status, updated_by: actorId })
    .eq('id', request_id)
    .select()
  if (error) throw error
  return data?.[0]
}

export async function getRequestById(request_id: string) {
  const { data, error } = await supabaseServer.from('requests').select('*').eq('id', request_id).maybeSingle()
  if (error) throw error
  return data
}
