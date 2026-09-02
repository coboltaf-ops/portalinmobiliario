import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/shared/lib/supabase'
import { demoSolicitudes } from '../demo-solicitudes'

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

export const useSolicitudesStore = create<SolicitudesState>()(persist((set, get) => ({
  solicitudes: [],
  loaded: false,
  fetchSolicitudes: async () => {
    try {
      const { data } = await (supabase as any).from('solicitudes').select('*')
      if (data && data.length > 0) { set({ solicitudes: data, loaded: true }); return }
    } catch { /* sin backend disponible */ }
    if (get().solicitudes.length === 0) set({ solicitudes: demoSolicitudes, loaded: true })
    else set({ loaded: true })
  },
  addSolicitud: async (s) => {
    const { error } = await (supabase as any).from('solicitudes').insert(s)
    if (error) throw new Error(error.message)
    set((st) => ({ solicitudes: [...st.solicitudes, s] }))
  },
  updateSolicitud: async (id, s) => {
    set((st) => ({ solicitudes: st.solicitudes.map((r) => r.id === id ? { ...r, ...s } : r) }))
    await (supabase as any).from('solicitudes').update(s).eq('id', id)
  },
  deleteSolicitud: async (id) => {
    set((st) => ({ solicitudes: st.solicitudes.filter((r) => r.id !== id) }))
    await (supabase as any).from('solicitudes').delete().eq('id', id)
  },
}), { name: 'portal-solicitudes-storage', storage: createJSONStorage(() => localStorage) }))
