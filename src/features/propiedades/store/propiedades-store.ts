import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

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

export const usePropiedadesStore = create<PropiedadesState>()((set, get) => ({
  propiedades: [],
  loaded: false,
  fetchPropiedades: async () => {

    const { data } = await supabase.from('propiedades').select('*')
    if (data) set({ propiedades: data, loaded: true })
  },
  addPropiedad: async (p) => {
    set((s) => ({ propiedades: [...s.propiedades, p] }))
    await supabase.from('propiedades').insert(p)
  },
  updatePropiedad: async (id, p) => {
    set((s) => ({ propiedades: s.propiedades.map((r) => r.id === id ? { ...r, ...p } : r) }))
    await supabase.from('propiedades').update(p).eq('id', id)
  },
  deletePropiedad: async (id) => {
    set((s) => ({ propiedades: s.propiedades.filter((r) => r.id !== id) }))
    await supabase.from('propiedades').delete().eq('id', id)
  },
}))
