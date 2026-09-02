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
    // Admin DEMO siempre disponible para entrar.
    const adminDemo: UserRecord = { id: 'demo-admin', usuario: 'admin', clave: 'admin123', nombre: 'Administrador', rol: 'Admin' }
    try {
      const { getCol } = await import('@/shared/lib/cloud')
      const data = await getCol<UserRecord[]>('usuarios')
      const cloud = Array.isArray(data) ? data : []
      // Garantizar que 'admin' siempre exista para poder ingresar.
      const hasAdmin = cloud.some(u => (u.usuario || '').toLowerCase() === 'admin')
      const users = hasAdmin ? cloud : [...cloud, adminDemo]
      set({ users, loaded: true, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn('Auth: usando admin demo (sin nube):', message)
      set({ users: [adminDemo], loaded: true, loading: false })
    }
  },
  setUser: (u) => set({ user: u }),
  logout: () => set({ user: null }),
}))
