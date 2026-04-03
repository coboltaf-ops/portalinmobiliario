import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

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
  fetchUsers: () => Promise<void>
  setUser: (u: AuthUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  users: [],
  loaded: false,
  fetchUsers: async () => {

    const { data } = await supabase.from('usuarios').select('*')
    if (data) set({ users: data, loaded: true })
  },
  setUser: (u) => set({ user: u }),
  logout: () => set({ user: null }),
}))
