import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

export type Cotizacion = {
  id: string
  nro_cotizacion: string
  fecha: string
  cliente_id: string
  propiedad_id: string
  comercial_id: string
  tipo_moneda: string
  precio_ofertado: number
  condiciones_pago: string
  observaciones: string
  situacion: string
  imagen?: string
}

interface CotizacionesState {
  cotizaciones: Cotizacion[]
  loaded: boolean
  fetchCotizaciones: () => Promise<void>
  addCotizacion: (c: Cotizacion) => Promise<void>
  updateCotizacion: (id: string, c: Partial<Cotizacion>) => Promise<void>
  deleteCotizacion: (id: string) => Promise<void>
}

export const useCotizacionesStore = create<CotizacionesState>()((set, get) => ({
  cotizaciones: [],
  loaded: false,
  fetchCotizaciones: async () => {
    if (get().loaded) return
    const { data } = await supabase.from('cotizaciones').select('*')
    if (data) set({ cotizaciones: data, loaded: true })
  },
  addCotizacion: async (c) => {
    set((s) => ({ cotizaciones: [...s.cotizaciones, c] }))
    await supabase.from('cotizaciones').insert(c)
  },
  updateCotizacion: async (id, c) => {
    set((s) => ({ cotizaciones: s.cotizaciones.map((r) => r.id === id ? { ...r, ...c } : r) }))
    await supabase.from('cotizaciones').update(c).eq('id', id)
  },
  deleteCotizacion: async (id) => {
    set((s) => ({ cotizaciones: s.cotizaciones.filter((r) => r.id !== id) }))
    await supabase.from('cotizaciones').delete().eq('id', id)
  },
}))
