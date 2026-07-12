import { createClient } from '@supabase/supabase-js'

// Lazy initialization to defer env var reading until first use
let supabaseInstance: ReturnType<typeof createClient> | undefined

export const supabase: ReturnType<typeof createClient> = new Proxy(
  Object.create(null),
  {
    get(target, prop) {
      if (!supabaseInstance) {
        // Initialize only on first access
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !key) {
          console.warn(
            'Supabase env vars not configured. Using placeholder client for build.'
          )
          // Use valid placeholder URLs to avoid "Invalid supabaseUrl" errors during build
          supabaseInstance = createClient(
            'https://placeholder.supabase.co',
            'placeholder-anon-key'
          )
        } else {
          supabaseInstance = createClient(url, key)
        }
      }

      return Reflect.get(supabaseInstance, prop, supabaseInstance)
    },
  }
) as ReturnType<typeof createClient>

