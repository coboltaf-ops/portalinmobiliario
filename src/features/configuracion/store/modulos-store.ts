import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

export type Modulo = {
  id: string
  nombre: string
  slug: string
  activo: boolean
  orden: number
  descripcion: string | null
}

interface ModulosState {
  modulos: Modulo[]
  loading: boolean
  fetchModulos: () => Promise<void>
  toggleModulo: (id: string) => Promise<void>
  getModulosActivos: () => Modulo[]
}

export const useModulosStore = create<ModulosState>()((set, get) => ({
  modulos: [],
  loading: false,
  fetchModulos: async () => {
    set({ loading: true })
    try {
      const { data, error } = await (supabase as any)
        .from('modulos')
        .select('*')
        .order('orden', { ascending: true })

      if (error) throw error
      set({ modulos: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching modulos:', error)
      set({ loading: false })
    }
  },
  toggleModulo: async (id: string) => {
    const modulo = get().modulos.find(m => m.id === id)
    if (!modulo) return

    try {
      const { error } = await (supabase as any)
        .from('modulos')
        .update({ activo: !modulo.activo })
        .eq('id', id)

      if (error) throw error

      set({
        modulos: get().modulos.map(m =>
          m.id === id ? { ...m, activo: !m.activo } : m
        ),
      })
    } catch (error) {
      console.error('Error toggling modulo:', error)
    }
  },
  getModulosActivos: () => {
    return get().modulos.filter(m => m.activo)
  },
}))
