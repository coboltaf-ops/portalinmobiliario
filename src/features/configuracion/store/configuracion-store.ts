import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

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

export const useConfigStore = create<ConfigState>()((set, get) => ({
  tiposPropiedad: [],
  monedas: [],
  ciudades: [],
  paises: [],
  situacionesPropiedad: [],
  tiposIdentificacion: [],
  origenesSolicitud: [],
  loaded: false,

  fetchConfig: async () => {
    if (get().loaded) return
    const { data } = await supabase.from('configuracion').select('*')
    if (data) {
      const grouped: Record<string, (RefItem | MonedaItem)[]> = {}
      for (const row of data) {
        const tabla = row.tabla as string
        if (!grouped[tabla]) grouped[tabla] = []
        if (tabla === 'monedas') {
          grouped[tabla].push({ id: row.id, nombre: row.nombre, simbolo: row.simbolo } as MonedaItem)
        } else if (tabla === 'ciudades') {
          grouped[tabla].push({ id: row.id, nombre: row.nombre, zonas: row.zonas ?? [] } as unknown as CiudadItem)
        } else {
          grouped[tabla].push({ id: row.id, nombre: row.nombre })
        }
      }
      set({
        tiposPropiedad: (grouped['tiposPropiedad'] ?? []) as RefItem[],
        monedas: (grouped['monedas'] ?? []) as MonedaItem[],
        ciudades: (grouped['ciudades'] ?? []) as unknown as CiudadItem[],
        paises: (grouped['paises'] ?? []) as RefItem[],
        situacionesPropiedad: (grouped['situacionesPropiedad'] ?? []) as RefItem[],
        tiposIdentificacion: (grouped['tiposIdentificacion'] ?? []) as RefItem[],
        origenesSolicitud: (grouped['origenesSolicitud'] ?? []) as RefItem[],
        loaded: true,
      })
    }
  },

  addItem: async (table, item) => {
    set((s) => {
      const arr = [...getTable(s, table), item]
      return { [table]: arr } as unknown as Partial<ConfigState>
    })
    const row: Record<string, unknown> = { id: item.id, nombre: item.nombre, tabla: table }
    if ('simbolo' in item) row.simbolo = item.simbolo
    await supabase.from('configuracion').insert(row)
  },

  updateItem: async (table, id, item) => {
    set((s) => {
      const arr = getTable(s, table).map((r) => r.id === id ? { ...r, ...item } : r)
      return { [table]: arr } as unknown as Partial<ConfigState>
    })
    const row: Record<string, unknown> = { ...item }
    delete row.id
    await supabase.from('configuracion').update(row).eq('id', id)
  },

  deleteItem: async (table, id) => {
    set((s) => {
      const arr = getTable(s, table).filter((r) => r.id !== id)
      return { [table]: arr } as unknown as Partial<ConfigState>
    })
    await supabase.from('configuracion').delete().eq('id', id)
  },

  addCiudad: async (ciudad) => {
    set((s) => ({ ciudades: [...s.ciudades, ciudad] }))
    await supabase.from('configuracion').insert({ id: ciudad.id, nombre: ciudad.nombre, tabla: 'ciudades', zonas: ciudad.zonas })
  },

  updateCiudad: async (id, nombre) => {
    set((s) => ({
      ciudades: s.ciudades.map(c => c.id === id ? { ...c, nombre } : c)
    }))
    await supabase.from('configuracion').update({ nombre }).eq('id', id)
  },

  deleteCiudad: async (id) => {
    set((s) => ({
      ciudades: s.ciudades.filter(c => c.id !== id)
    }))
    await supabase.from('configuracion').delete().eq('id', id)
  },

  addZonaToCiudad: async (ciudadId, zona) => {
    const newCiudades = get().ciudades.map(c =>
      c.id === ciudadId ? { ...c, zonas: [...c.zonas, zona] } : c
    )
    set({ ciudades: newCiudades })
    const ciudad = newCiudades.find(c => c.id === ciudadId)
    if (ciudad) {
      await supabase.from('configuracion').update({ zonas: ciudad.zonas }).eq('id', ciudadId)
    }
  },

  updateZonaInCiudad: async (ciudadId, zonaId, nombre) => {
    const newCiudades = get().ciudades.map(c =>
      c.id === ciudadId ? { ...c, zonas: c.zonas.map(z => z.id === zonaId ? { ...z, nombre } : z) } : c
    )
    set({ ciudades: newCiudades })
    const ciudad = newCiudades.find(c => c.id === ciudadId)
    if (ciudad) {
      await supabase.from('configuracion').update({ zonas: ciudad.zonas }).eq('id', ciudadId)
    }
  },

  deleteZonaFromCiudad: async (ciudadId, zonaId) => {
    const newCiudades = get().ciudades.map(c =>
      c.id === ciudadId ? { ...c, zonas: c.zonas.filter(z => z.id !== zonaId) } : c
    )
    set({ ciudades: newCiudades })
    const ciudad = newCiudades.find(c => c.id === ciudadId)
    if (ciudad) {
      await supabase.from('configuracion').update({ zonas: ciudad.zonas }).eq('id', ciudadId)
    }
  },
}))

// Helper: get all zonas across all ciudades (flat list, unique names)
export function getAllZonas(ciudades: CiudadItem[]): RefItem[] {
  const seen = new Set<string>()
  const result: RefItem[] = []
  for (const c of ciudades) {
    for (const z of c.zonas) {
      if (!seen.has(z.nombre)) {
        seen.add(z.nombre)
        result.push(z)
      }
    }
  }
  return result
}

// Helper: get zonas for a specific ciudad name
export function getZonasByCiudad(ciudades: CiudadItem[], ciudadNombre: string): RefItem[] {
  const ciudad = ciudades.find(c => c.nombre === ciudadNombre)
  return ciudad?.zonas ?? []
}
