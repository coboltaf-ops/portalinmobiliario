import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'
import { demoPropiedades } from '../demo-propiedades'

export type Propiedad = {
  id: string
  nro_propiedad: number
  codigo: string
  urbanizacion: string
  nro_apto_casa: string
  tipo_propiedad: string
  modalidad: string
  precio_venta: number
  precio_alquiler: number
  tipo_moneda: string
  area_m2: number
  habitaciones: number
  banos: number
  estacionamientos: number
  balcones: number
  cuarto_ropas: boolean
  cuarto_servicio: boolean
  piscina: boolean
  juegos_infantiles: boolean
  gimnasio: boolean
  monto_administracion_mes: number
  monto_predial_anual: number
  amenidades: string
  direccion: string
  ciudad: string
  zona: string
  estado: string
  asesor_asignado: string
  descripcion: string
  imagenes: string[]
}

interface PropiedadesState {
  propiedades: Propiedad[]
  loaded: boolean
  fetchPropiedades: () => Promise<void>
  addPropiedad: (p: Propiedad) => Promise<void>
  updatePropiedad: (id: string, p: Partial<Propiedad>) => Promise<void>
  deletePropiedad: (id: string) => Promise<void>
}

export const usePropiedadesStore = create<PropiedadesState>()(persist((set, get) => ({
  propiedades: [],
  loaded: false,
  fetchPropiedades: async () => {
    const data = await getCol<Propiedad[]>('propiedades')
    if (Array.isArray(data) && data.length > 0) { set({ propiedades: data, loaded: true }); return }
    // Respaldo DEMO: si no hay nube, sembramos el catálogo solo si está vacío;
    // de lo contrario conservamos lo que el usuario creó (persistido en localStorage).
    if (get().propiedades.length === 0) set({ propiedades: demoPropiedades, loaded: true })
    else set({ loaded: true })
  },
  addPropiedad: async (p) => {
    const arr = [...get().propiedades, p]
    set({ propiedades: arr })
    await saveCol('propiedades', arr)
  },
  updatePropiedad: async (id, p) => {
    const arr = get().propiedades.map((r) => r.id === id ? { ...r, ...p } : r)
    set({ propiedades: arr })
    await saveCol('propiedades', arr)
  },
  deletePropiedad: async (id) => {
    const arr = get().propiedades.filter((r) => r.id !== id)
    set({ propiedades: arr })
    await saveCol('propiedades', arr)
  },
}), { name: 'portal-propiedades-storage', storage: createJSONStorage(() => localStorage) }))
