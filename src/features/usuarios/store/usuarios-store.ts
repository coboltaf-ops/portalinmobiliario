import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'

export type Usuario = {
  id: string
  usuario: string
  nombre: string
  clave?: string
  rol: 'Admin' | 'User'
  created_at?: string
}

interface UsuariosState {
  usuarios: Usuario[]
  loaded: boolean
  loading: boolean
  error: string | null
  fetchUsuarios: () => Promise<void>
  addUsuario: (u: Usuario) => Promise<void>
  updateUsuario: (id: string, u: Partial<Usuario>) => Promise<void>
  deleteUsuario: (id: string) => Promise<void>
  clearError: () => void
}

export const useUsuariosStore = create<UsuariosState>()(persist((set, get) => ({
  usuarios: [],
  loaded: false,
  loading: false,
  error: null,

  fetchUsuarios: async () => {
    set({ loading: true, error: null })
    const data = await getCol<Usuario[]>('usuarios')
    if (Array.isArray(data) && data.length > 0) {
      set({ usuarios: data, loaded: true, loading: false })
      return
    }
    // Conserva lo persistido en localStorage cuando no hay nube
    set({ loaded: true, loading: false })
  },

  addUsuario: async (u) => {
    set({ error: null })
    try {
      // Guardamos el registro completo (incluida la clave) en la nube.
      const newUsuario: Usuario = {
        id: u.id,
        usuario: u.usuario,
        nombre: u.nombre,
        rol: u.rol,
        clave: u.clave || '',
        created_at: new Date().toISOString(),
      }
      const arr = [newUsuario, ...get().usuarios]
      set({ usuarios: arr })
      await saveCol('usuarios', arr)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  updateUsuario: async (id, u) => {
    set({ error: null })
    try {
      // Si la clave viene vacía, no la sobrescribimos (se conserva la actual)
      const { clave, ...rest } = u
      const patch: Partial<Usuario> = { ...rest }
      if (clave && clave.trim()) patch.clave = clave

      const arr = get().usuarios.map((usr) =>
        usr.id === id ? { ...usr, ...patch } : usr
      )
      set({ usuarios: arr })
      await saveCol('usuarios', arr)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  deleteUsuario: async (id) => {
    set({ error: null })
    try {
      const arr = get().usuarios.filter((usr) => usr.id !== id)
      set({ usuarios: arr })
      await saveCol('usuarios', arr)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  clearError: () => set({ error: null }),
}), { name: 'portal-usuarios-storage', storage: createJSONStorage(() => localStorage) }))
