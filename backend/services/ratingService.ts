import supabaseServer from '../config/supabaseServer'

export async function addRating(payload: any) {
  const { data, error } = await supabaseServer.from('ratings').insert(payload).select()
  if (error) throw error

  // update mentor reputation (simple average aggregation)
  try {
    const { data: agg } = await supabaseServer
      .from('ratings')
      .select('mentor_id, rating', { count: 'exact' })
      .eq('mentor_id', payload.mentor_id)

    // compute average
    if (agg) {
      const ratings = agg.map((r: any) => r.rating)
      const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      await supabaseServer.from('profiles').update({ reputation: avg }).eq('id', payload.mentor_id)
    }
  } catch (e) {
    // ignore aggregation errors for now
  }

  return data?.[0]
}
