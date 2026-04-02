import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

export type Solicitud = {
  id: string
  codigo: string
  fecha: string
  nombre: string
  apellido: string
  correo: string
  telefono: string
  mensaje: string
  origen: string
  propiedad_id: string
  estado: string // Nueva, En Atencion, Atendida, Descartada
  comercial_asignado: string
  notas: string
}

interface SolicitudesState {
  solicitudes: Solicitud[]
  loaded: boolean
  fetchSolicitudes: () => Promise<void>
  addSolicitud: (s: Solicitud) => Promise<void>
  updateSolicitud: (id: string, s: Partial<Solicitud>) => Promise<void>
  deleteSolicitud: (id: string) => Promise<void>
}

export const useSolicitudesStore = create<SolicitudesState>()((set, get) => ({
  solicitudes: [],
  loaded: false,
  fetchSolicitudes: async () => {
    if (get().loaded) return
    const { data } = await supabase.from('solicitudes').select('*')
    if (data) set({ solicitudes: data, loaded: true })
  },
  addSolicitud: async (s) => {
    set((st) => ({ solicitudes: [...st.solicitudes, s] }))
    await supabase.from('solicitudes').insert(s)
  },
  updateSolicitud: async (id, s) => {
    set((st) => ({ solicitudes: st.solicitudes.map((r) => r.id === id ? { ...r, ...s } : r) }))
    await supabase.from('solicitudes').update(s).eq('id', id)
  },
  deleteSolicitud: async (id) => {
    set((st) => ({ solicitudes: st.solicitudes.filter((r) => r.id !== id) }))
    await supabase.from('solicitudes').delete().eq('id', id)
  },
}))
