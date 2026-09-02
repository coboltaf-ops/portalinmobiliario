import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'
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
    const data = await getCol<Solicitud[]>('solicitudes')
    if (Array.isArray(data) && data.length > 0) { set({ solicitudes: data, loaded: true }); return }
    if (get().solicitudes.length === 0) set({ solicitudes: demoSolicitudes, loaded: true })
    else set({ loaded: true })
  },
  addSolicitud: async (s) => {
    const arr = [...get().solicitudes, s]
    set({ solicitudes: arr })
    await saveCol('solicitudes', arr)
  },
  updateSolicitud: async (id, s) => {
    const arr = get().solicitudes.map((r) => r.id === id ? { ...r, ...s } : r)
    set({ solicitudes: arr })
    await saveCol('solicitudes', arr)
  },
  deleteSolicitud: async (id) => {
    const arr = get().solicitudes.filter((r) => r.id !== id)
    set({ solicitudes: arr })
    await saveCol('solicitudes', arr)
  },
}), { name: 'portal-solicitudes-storage', storage: createJSONStorage(() => localStorage) }))
