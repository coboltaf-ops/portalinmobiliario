import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'

export type RefItem = { id: string; nombre: string }
export type MonedaItem = { id: string; nombre: string; simbolo: string }
export type CiudadItem = { id: string; nombre: string; zonas: RefItem[] }

interface ConfigState {
  tiposPropiedad: RefItem[]
  monedas: MonedaItem[]
  ciudades: CiudadItem[]
  paises: RefItem[]
  situacionesPropiedad: RefItem[]
  tiposIdentificacion: RefItem[]
  origenesSolicitud: RefItem[]
  loaded: boolean
  fetchConfig: () => Promise<void>
  addItem: (table: string, item: RefItem | MonedaItem) => Promise<void>
  updateItem: (table: string, id: string, item: Partial<RefItem | MonedaItem>) => Promise<void>
  deleteItem: (table: string, id: string) => Promise<void>
  addCiudad: (ciudad: CiudadItem) => Promise<void>
  updateCiudad: (id: string, nombre: string) => Promise<void>
  deleteCiudad: (id: string) => Promise<void>
  addZonaToCiudad: (ciudadId: string, zona: RefItem) => Promise<void>
  updateZonaInCiudad: (ciudadId: string, zonaId: string, nombre: string) => Promise<void>
  deleteZonaFromCiudad: (ciudadId: string, zonaId: string) => Promise<void>
}

const getTable = (state: ConfigState, table: string): (RefItem | MonedaItem)[] => {
  switch (table) {
    case 'tiposPropiedad': return state.tiposPropiedad
    case 'monedas': return state.monedas
    case 'paises': return state.paises
    case 'situacionesPropiedad': return state.situacionesPropiedad
    case 'tiposIdentificacion': return state.tiposIdentificacion
    case 'origenesSolicitud': return state.origenesSolicitud
    default: return []
  }
}

// Reúne todas las listas de configuración del estado en un solo objeto para persistir en la nube.
const collectConfig = (state: ConfigState) => ({
  tiposPropiedad: state.tiposPropiedad,
  monedas: state.monedas,
  ciudades: state.ciudades,
  paises: state.paises,
  situacionesPropiedad: state.situacionesPropiedad,
  tiposIdentificacion: state.tiposIdentificacion,
  origenesSolicitud: state.origenesSolicitud,
})

export const useConfigStore = create<ConfigState>()(persist((set, get) => ({
  tiposPropiedad: [],
  monedas: [],
  ciudades: [],
  paises: [],
  situacionesPropiedad: [],
  tiposIdentificacion: [],
  origenesSolicitud: [],
  loaded: false,

  fetchConfig: async () => {
    const data = await getCol<Record<string, unknown>>('configuracion')
    // Conserva la configuración persistida en localStorage cuando no hay nube
    if (!data || typeof data !== 'object' || Array.isArray(data)) { set({ loaded: true }); return }
    set({
      tiposPropiedad: (data.tiposPropiedad ?? get().tiposPropiedad) as RefItem[],
      monedas: (data.monedas ?? get().monedas) as MonedaItem[],
      ciudades: (data.ciudades ?? get().ciudades) as CiudadItem[],
      paises: (data.paises ?? get().paises) as RefItem[],
      situacionesPropiedad: (data.situacionesPropiedad ?? get().situacionesPropiedad) as RefItem[],
      tiposIdentificacion: (data.tiposIdentificacion ?? get().tiposIdentificacion) as RefItem[],
      origenesSolicitud: (data.origenesSolicitud ?? get().origenesSolicitud) as RefItem[],
      loaded: true,
    })
  },

  addItem: async (table, item) => {
    set((s) => ({ [table]: [...getTable(s, table), item] } as unknown as Partial<ConfigState>))
    await saveCol('configuracion', collectConfig(get()))
  },

  updateItem: async (table, id, item) => {
    set((s) => ({ [table]: getTable(s, table).map((r) => r.id === id ? { ...r, ...item } : r) } as unknown as Partial<ConfigState>))
    await saveCol('configuracion', collectConfig(get()))
  },

  deleteItem: async (table, id) => {
    set((s) => ({ [table]: getTable(s, table).filter((r) => r.id !== id) } as unknown as Partial<ConfigState>))
    await saveCol('configuracion', collectConfig(get()))
  },

  addCiudad: async (ciudad) => {
    set((s) => ({ ciudades: [...s.ciudades, ciudad] }))
    await saveCol('configuracion', collectConfig(get()))
  },

  updateCiudad: async (id, nombre) => {
    set((s) => ({ ciudades: s.ciudades.map(c => c.id === id ? { ...c, nombre } : c) }))
    await saveCol('configuracion', collectConfig(get()))
  },

  deleteCiudad: async (id) => {
    set((s) => ({ ciudades: s.ciudades.filter(c => c.id !== id) }))
    await saveCol('configuracion', collectConfig(get()))
  },

  addZonaToCiudad: async (ciudadId, zona) => {
    const newCiudades = get().ciudades.map(c => c.id === ciudadId ? { ...c, zonas: [...c.zonas, zona] } : c)
    set({ ciudades: newCiudades })
    await saveCol('configuracion', collectConfig(get()))
  },

  updateZonaInCiudad: async (ciudadId, zonaId, nombre) => {
    const newCiudades = get().ciudades.map(c => c.id === ciudadId ? { ...c, zonas: c.zonas.map(z => z.id === zonaId ? { ...z, nombre } : z) } : c)
    set({ ciudades: newCiudades })
    await saveCol('configuracion', collectConfig(get()))
  },

  deleteZonaFromCiudad: async (ciudadId, zonaId) => {
    const newCiudades = get().ciudades.map(c => c.id === ciudadId ? { ...c, zonas: c.zonas.filter(z => z.id !== zonaId) } : c)
    set({ ciudades: newCiudades })
    await saveCol('configuracion', collectConfig(get()))
  },
}), { name: 'portal-configuracion-storage', storage: createJSONStorage(() => localStorage) }))

export function getAllZonas(ciudades: CiudadItem[]): RefItem[] {
  const seen = new Set<string>()
  const result: RefItem[] = []
  for (const c of ciudades) {
    for (const z of (c.zonas || [])) {
      if (!seen.has(z.nombre)) { seen.add(z.nombre); result.push(z) }
    }
  }
  return result
}

export function getZonasByCiudad(ciudades: CiudadItem[], ciudadNombre: string): RefItem[] {
  const ciudad = ciudades.find(c => c.nombre === ciudadNombre)
  return ciudad?.zonas ?? []
}
