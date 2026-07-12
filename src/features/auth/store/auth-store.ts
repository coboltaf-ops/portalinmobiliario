import { create } from 'zustand'

export type AuthUser = {
  usuario: string
  nombre: string
  rol: string
}

type UserRecord = { id: string; usuario: string; clave: string; nombre: string; rol: string }

interface AuthState {
  user: AuthUser | null
  users: UserRecord[]
  loaded: boolean
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  setUser: (u: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  users: [],
  loaded: false,
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true, error: null })
    try {
      const { supabase } = await import('@/shared/lib/supabase')
      const { data, error: supabaseError } = await (supabase as any).from('usuarios').select('*')

      if (supabaseError) {
        console.error('Error fetching users from Supabase:', supabaseError)
        set({ error: `Error cargando usuarios: ${supabaseError.message}`, loading: false })
        return
      }

      if (!data) {
        console.error('No data returned from Supabase usuarios query')
        set({ error: 'No se pudieron cargar los usuarios', loading: false })
        return
      }

      if (data.length === 0) {
        console.warn('No usuarios found in Supabase')
      }

      set({ users: data, loaded: true, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Exception fetching users:', message)
      set({ error: `Error: ${message}`, loading: false })
    }
  },
  setUser: (u) => set({ user: u }),
  logout: () => set({ user: null }),
}))
