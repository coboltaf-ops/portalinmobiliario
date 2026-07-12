import { createClient } from '@supabase/supabase-js'

// Lazy initialization to defer env var reading until first use
let supabaseInstance: ReturnType<typeof createClient> | undefined

export const supabase: ReturnType<typeof createClient> = new Proxy(
  Object.create(null),
  {
    get(target, prop) {
      if (!supabaseInstance) {
        // Initialize only on first access
        let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
        let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SU_BASE_ANON_KEY?.trim()

        // Fallback to hardcoded values if env vars are not valid
        if (!url || !url.startsWith('https://')) {
          url = 'https://uogxmoocqskwplfcjfxo.supabase.co'
        }
        if (!key) {
          key = 'sb_publishable_KDVVzNrSsR-KpUNV1b7_Kg_fE8Zc2sJ'
        }

        supabaseInstance = createClient(url, key)
      }

      return Reflect.get(supabaseInstance, prop, supabaseInstance)
    },
  }
) as ReturnType<typeof createClient>

