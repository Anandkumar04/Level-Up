import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let client: any

if (supabaseUrl && supabaseAnonKey) {
	client = createClient(supabaseUrl, supabaseAnonKey)
} else {
	// fallback stub to avoid runtime errors during local builds when env isn't set
	client = {
		from: () => ({ select: async () => ({ data: null, error: null }), insert: async () => ({ data: null, error: null }), upsert: async () => ({ data: null, error: null }) }),
		auth: {
			onAuthStateChange: (cb?: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
			signInWithOAuth: async (_: any) => ({ data: null, error: null }),
			signUp: async (_: any) => ({ data: null, error: null }),
			signInWithPassword: async (_: any) => ({ data: null, error: null }),
			signOut: async () => ({ error: null }),
			getSession: async () => ({ data: { session: null }, error: null }),
		},
	}
}

export const supabaseClient = client
export const supabase = supabaseClient

export default supabaseClient
