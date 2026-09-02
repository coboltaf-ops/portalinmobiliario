import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/shared/lib/supabase'
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
    try {
      const { data } = await (supabase as any).from('propiedades').select('*')
      if (data && data.length > 0) { set({ propiedades: data, loaded: true }); return }
    } catch { /* sin backend disponible */ }
    // Respaldo DEMO: si no hay backend, sembramos el catálogo solo si está vacío;
    // de lo contrario conservamos lo que el usuario creó (persistido en localStorage).
    if (get().propiedades.length === 0) set({ propiedades: demoPropiedades, loaded: true })
    else set({ loaded: true })
  },
  addPropiedad: async (p) => {
    set((s) => ({ propiedades: [...s.propiedades, p] }))
    await (supabase as any).from('propiedades').insert(p)
  },
  updatePropiedad: async (id, p) => {
    set((s) => ({ propiedades: s.propiedades.map((r) => r.id === id ? { ...r, ...p } : r) }))
    await (supabase as any).from('propiedades').update(p).eq('id', id)
  },
  deletePropiedad: async (id) => {
    set((s) => ({ propiedades: s.propiedades.filter((r) => r.id !== id) }))
    await (supabase as any).from('propiedades').delete().eq('id', id)
  },
}), { name: 'portal-propiedades-storage', storage: createJSONStorage(() => localStorage) }))
