import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

export type Modulo = {
  id: string
  nombre: string
  descripcion: string
  url?: string
  estado: boolean
  roles_permitidos: string[]
  created_at?: string
}

interface ModulosState {
  modulos: Modulo[]
  loaded: boolean
  loading: boolean
  error: string | null
  fetchModulos: () => Promise<void>
  addModulo: (m: Modulo) => Promise<void>
  updateModulo: (id: string, m: Partial<Modulo>) => Promise<void>
  deleteModulo: (id: string) => Promise<void>
  toggleModulo: (id: string) => Promise<void>
  clearError: () => void
}

export const useModulosStore = create<ModulosState>()((set, get) => ({
  modulos: [],
  loaded: false,
  loading: false,
  error: null,

  fetchModulos: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error: supabaseError } = await (supabase as any)
        .from('modulos')
        .select('id, nombre, descripcion, url, estado, roles_permitidos, created_at')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        set({ error: `Error al cargar módulos: ${supabaseError.message}`, loading: false })
        return
      }

      if (data) {
        const modulos = data.map((m: any) => ({
          ...m,
          roles_permitidos: Array.isArray(m.roles_permitidos) ? m.roles_permitidos : [],
        }))
        set({ modulos, loaded: true, loading: false })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}`, loading: false })
    }
  },

  addModulo: async (m) => {
    set({ error: null })
    try {
      const { error: supabaseError } = await (supabase as any)
        .from('modulos')
        .insert({
          id: m.id,
          nombre: m.nombre,
          descripcion: m.descripcion,
          url: m.url || null,
          estado: m.estado,
          roles_permitidos: m.roles_permitidos || [],
        })

      if (supabaseError) {
        set({ error: `Error al crear módulo: ${supabaseError.message}` })
        return
      }

      const newModulo: Modulo = {
        id: m.id,
        nombre: m.nombre,
        descripcion: m.descripcion,
        url: m.url,
        estado: m.estado,
        roles_permitidos: m.roles_permitidos || [],
        created_at: new Date().toISOString(),
      }
      set((s) => ({ modulos: [newModulo, ...s.modulos] }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  updateModulo: async (id, m) => {
    set({ error: null })
    try {
      const updateData = {
        ...m,
        roles_permitidos: m.roles_permitidos || [],
      }

      const { error: supabaseError } = await (supabase as any)
        .from('modulos')
        .update(updateData)
        .eq('id', id)

      if (supabaseError) {
        set({ error: `Error al actualizar módulo: ${supabaseError.message}` })
        return
      }

      set((s) => ({
        modulos: s.modulos.map((mod) =>
          mod.id === id ? { ...mod, ...updateData } : mod
        ),
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  deleteModulo: async (id) => {
    set({ error: null })
    try {
      const { error: supabaseError } = await (supabase as any)
        .from('modulos')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        set({ error: `Error al eliminar módulo: ${supabaseError.message}` })
        return
      }

      set((s) => ({
        modulos: s.modulos.filter((mod) => mod.id !== id),
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  toggleModulo: async (id) => {
    set({ error: null })
    try {
      const modulo = get().modulos.find((m) => m.id === id)
      if (!modulo) {
        set({ error: 'Módulo no encontrado' })
        return
      }

      const newEstado = !modulo.estado

      const { error: supabaseError } = await (supabase as any)
        .from('modulos')
        .update({ estado: newEstado })
        .eq('id', id)

      if (supabaseError) {
        set({ error: `Error al cambiar estado del módulo: ${supabaseError.message}` })
        return
      }

      set((s) => ({
        modulos: s.modulos.map((mod) =>
          mod.id === id ? { ...mod, estado: newEstado } : mod
        ),
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  clearError: () => set({ error: null }),
}))
