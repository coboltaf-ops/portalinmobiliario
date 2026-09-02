import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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

export const useCotizacionesStore = create<CotizacionesState>()(persist((set, get) => ({
  cotizaciones: [],
  loaded: false,
  fetchCotizaciones: async () => {
    try {
      const { data } = await (supabase as any).from('cotizaciones').select('*')
      if (data && data.length > 0) { set({ cotizaciones: data, loaded: true }); return }
    } catch { /* sin backend disponible */ }
    set({ loaded: true })
  },
  addCotizacion: async (c) => {
    set((s) => ({ cotizaciones: [...s.cotizaciones, c] }))
    await (supabase as any).from('cotizaciones').insert(c)
  },
  updateCotizacion: async (id, c) => {
    set((s) => ({ cotizaciones: s.cotizaciones.map((r) => r.id === id ? { ...r, ...c } : r) }))
    await (supabase as any).from('cotizaciones').update(c).eq('id', id)
  },
  deleteCotizacion: async (id) => {
    set((s) => ({ cotizaciones: s.cotizaciones.filter((r) => r.id !== id) }))
    await (supabase as any).from('cotizaciones').delete().eq('id', id)
  },
}), { name: 'portal-cotizaciones-storage', storage: createJSONStorage(() => localStorage) }))
