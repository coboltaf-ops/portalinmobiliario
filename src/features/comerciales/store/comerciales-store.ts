import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

export type Comercial = {
  id: string
  codigo: string
  nombre: string
  apellido: string
  correo: string
  telefono: string
  movil: string
  cargo: string
  departamento: string
  zona_asignada: string
  foto: string
  situacion: string
}

interface ComercialesState {
  comerciales: Comercial[]
  loaded: boolean
  fetchComerciales: () => Promise<void>
  addComercial: (c: Comercial) => Promise<void>
  updateComercial: (id: string, c: Partial<Comercial>) => Promise<void>
  deleteComercial: (id: string) => Promise<void>
}

export const useComercialesStore = create<ComercialesState>()((set, get) => ({
  comerciales: [],
  loaded: false,
  fetchComerciales: async () => {

    const { data } = await (supabase as any).from('comerciales').select('*')
    if (data) set({ comerciales: data, loaded: true })
  },
  addComercial: async (c) => {
    set((s) => ({ comerciales: [...s.comerciales, c] }))
    await (supabase as any).from('comerciales').insert(c)
  },
  updateComercial: async (id, c) => {
    set((s) => ({ comerciales: s.comerciales.map((r) => r.id === id ? { ...r, ...c } : r) }))
    await (supabase as any).from('comerciales').update(c).eq('id', id)
  },
  deleteComercial: async (id) => {
    set((s) => ({ comerciales: s.comerciales.filter((r) => r.id !== id) }))
    await (supabase as any).from('comerciales').delete().eq('id', id)
  },
}))
