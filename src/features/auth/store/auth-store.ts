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
    // Usuario DEMO de respaldo (cuando no hay backend con usuarios).
    const demoUsers: UserRecord[] = [
      { id: 'demo-admin', usuario: 'admin', clave: 'admin123', nombre: 'Administrador', rol: 'Admin' },
    ]
    try {
      const { supabase } = await import('@/shared/lib/supabase')
      const { data } = await (supabase as any).from('usuarios').select('*')
      if (data && data.length > 0) {
        set({ users: data, loaded: true, loading: false })
        return
      }
      // Sin usuarios en backend → usar demo
      set({ users: demoUsers, loaded: true, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn('Auth: usando usuario demo (sin backend):', message)
      set({ users: demoUsers, loaded: true, loading: false })
    }
  },
  setUser: (u) => set({ user: u }),
  logout: () => set({ user: null }),
}))
