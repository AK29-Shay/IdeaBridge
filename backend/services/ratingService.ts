import supabaseServer from '../config/supabaseServer'

type RatingPayload = {
  mentor_id: string
  rating: number
  [key: string]: unknown
}

type RatingRow = {
  mentor_id: string
  rating: number
}

export async function addRating(payload: RatingPayload) {
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
      const ratings = (agg as RatingRow[]).map((r) => r.rating)
      const avg = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      await supabaseServer.from('profiles').update({ reputation: avg }).eq('id', payload.mentor_id)
    }
  } catch {
    // ignore aggregation errors for now
  }

  return data?.[0]
}
