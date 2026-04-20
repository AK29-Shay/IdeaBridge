/**
 * supabaseClient.ts
 * Browser-safe Supabase client initialised with the public anon key.
 * Use this on the client side (React components, hooks).
 * Never use the service-role key on the client.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export default supabaseClient
