import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'

export type Rol = {
  id: string
  nombre: string
  descripcion: string
  created_at?: string
}

interface RolesState {
  roles: Rol[]
  loaded: boolean
  loading: boolean
  error: string | null
  fetchRoles: () => Promise<void>
  addRol: (r: Rol) => Promise<void>
  updateRol: (id: string, r: Partial<Rol>) => Promise<void>
  deleteRol: (id: string) => Promise<void>
  clearError: () => void
}

export const useRolesStore = create<RolesState>()(persist((set, get) => ({
  roles: [],
  loaded: false,
  loading: false,
  error: null,

  fetchRoles: async () => {
    set({ loading: true, error: null })
    const data = await getCol<Rol[]>('roles')
    if (Array.isArray(data) && data.length > 0) {
      set({ roles: data, loaded: true, loading: false })
      return
    }
    // Conserva lo persistido en localStorage cuando no hay nube
    set({ loaded: true, loading: false })
  },

  addRol: async (r) => {
    set({ error: null })
    try {
      const newRol: Rol = {
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion,
        created_at: new Date().toISOString(),
      }
      const arr = [newRol, ...get().roles]
      set({ roles: arr })
      await saveCol('roles', arr)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  updateRol: async (id, r) => {
    set({ error: null })
    try {
      const arr = get().roles.map((rol) =>
        rol.id === id ? { ...rol, ...r } : rol
      )
      set({ roles: arr })
      await saveCol('roles', arr)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  deleteRol: async (id) => {
    set({ error: null })
    try {
      const arr = get().roles.filter((rol) => rol.id !== id)
      set({ roles: arr })
      await saveCol('roles', arr)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  clearError: () => set({ error: null }),
}), { name: 'portal-roles-storage', storage: createJSONStorage(() => localStorage) }))
