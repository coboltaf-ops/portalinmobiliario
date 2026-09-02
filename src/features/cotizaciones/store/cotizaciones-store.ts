import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'
import { demoCotizaciones } from '../demo-cotizaciones'

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
    const data = await getCol<Cotizacion[]>('cotizaciones')
    if (Array.isArray(data) && data.length > 0) { set({ cotizaciones: data, loaded: true }); return }
    if (get().cotizaciones.length === 0) set({ cotizaciones: demoCotizaciones, loaded: true })
    else set({ loaded: true })
  },
  addCotizacion: async (c) => {
    const arr = [...get().cotizaciones, c]
    set({ cotizaciones: arr })
    await saveCol('cotizaciones', arr)
  },
  updateCotizacion: async (id, c) => {
    const arr = get().cotizaciones.map((r) => r.id === id ? { ...r, ...c } : r)
    set({ cotizaciones: arr })
    await saveCol('cotizaciones', arr)
  },
  deleteCotizacion: async (id) => {
    const arr = get().cotizaciones.filter((r) => r.id !== id)
    set({ cotizaciones: arr })
    await saveCol('cotizaciones', arr)
  },
}), { name: 'portal-cotizaciones-storage', storage: createJSONStorage(() => localStorage) }))
