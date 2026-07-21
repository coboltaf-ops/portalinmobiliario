import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

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

export const useRolesStore = create<RolesState>()((set, get) => ({
  roles: [],
  loaded: false,
  loading: false,
  error: null,

  fetchRoles: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error: supabaseError } = await (supabase as any)
        .from('roles')
        .select('id, nombre, descripcion, created_at')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        set({ error: `Error al cargar roles: ${supabaseError.message}`, loading: false })
        return
      }

      if (data) {
        set({ roles: data, loaded: true, loading: false })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}`, loading: false })
    }
  },

  addRol: async (r) => {
    set({ error: null })
    try {
      const { error: supabaseError } = await (supabase as any)
        .from('roles')
        .insert({
          id: r.id,
          nombre: r.nombre,
          descripcion: r.descripcion,
        })

      if (supabaseError) {
        set({ error: `Error al crear rol: ${supabaseError.message}` })
        return
      }

      const newRol: Rol = {
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion,
        created_at: new Date().toISOString(),
      }
      set((s) => ({ roles: [newRol, ...s.roles] }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  updateRol: async (id, r) => {
    set({ error: null })
    try {
      const { error: supabaseError } = await (supabase as any)
        .from('roles')
        .update(r)
        .eq('id', id)

      if (supabaseError) {
        set({ error: `Error al actualizar rol: ${supabaseError.message}` })
        return
      }

      set((s) => ({
        roles: s.roles.map((rol) =>
          rol.id === id ? { ...rol, ...r } : rol
        ),
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  deleteRol: async (id) => {
    set({ error: null })
    try {
      const { error: supabaseError } = await (supabase as any)
        .from('roles')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        set({ error: `Error al eliminar rol: ${supabaseError.message}` })
        return
      }

      set((s) => ({
        roles: s.roles.filter((rol) => rol.id !== id),
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  clearError: () => set({ error: null }),
}))
