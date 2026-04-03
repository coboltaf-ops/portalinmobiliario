import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

export type RefItem = { id: string; nombre: string }
export type MonedaItem = { id: string; nombre: string; simbolo: string }

interface ConfigState {
  tiposPropiedad: RefItem[]
  monedas: MonedaItem[]
  zonas: RefItem[]
  ciudades: RefItem[]
  paises: RefItem[]
  situacionesPropiedad: RefItem[]
  tiposIdentificacion: RefItem[]
  origenesSolicitud: RefItem[]
  loaded: boolean
  fetchConfig: () => Promise<void>
  addItem: (table: string, item: RefItem | MonedaItem) => Promise<void>
  updateItem: (table: string, id: string, item: Partial<RefItem | MonedaItem>) => Promise<void>
  deleteItem: (table: string, id: string) => Promise<void>
}

const getTable = (state: ConfigState, table: string): (RefItem | MonedaItem)[] => {
  switch (table) {
    case 'tiposPropiedad': return state.tiposPropiedad
    case 'monedas': return state.monedas
    case 'zonas': return state.zonas
    case 'ciudades': return state.ciudades
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
  zonas: [],
  ciudades: [],
  paises: [],
  situacionesPropiedad: [],
  tiposIdentificacion: [],
  origenesSolicitud: [],
  loaded: false,

  fetchConfig: async () => {
    if (get().loaded) return
    const { data } = await supabase.from('configuracion').select('*')
    if (!data) return
    const grouped: Record<string, (RefItem | MonedaItem)[]> = {}
    for (const row of data) {
      const tabla = row.tabla as string
      if (!grouped[tabla]) grouped[tabla] = []
      if (tabla === 'monedas') {
        grouped[tabla].push({ id: row.id, nombre: row.nombre, simbolo: row.simbolo || '$' } as MonedaItem)
      } else {
        grouped[tabla].push({ id: row.id, nombre: row.nombre })
      }
    }
    set({
      tiposPropiedad: (grouped['tiposPropiedad'] ?? []) as RefItem[],
      monedas: (grouped['monedas'] ?? []) as MonedaItem[],
      zonas: (grouped['zonas'] ?? []) as RefItem[],
      ciudades: (grouped['ciudades'] ?? []) as RefItem[],
      paises: (grouped['paises'] ?? []) as RefItem[],
      situacionesPropiedad: (grouped['situacionesPropiedad'] ?? []) as RefItem[],
      tiposIdentificacion: (grouped['tiposIdentificacion'] ?? []) as RefItem[],
      origenesSolicitud: (grouped['origenesSolicitud'] ?? []) as RefItem[],
      loaded: true,
    })
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
    const row: Record<string, unknown> = {}
    if ('nombre' in item) row.nombre = item.nombre
    if ('simbolo' in item) row.simbolo = (item as MonedaItem).simbolo
    await supabase.from('configuracion').update(row).eq('id', id)
  },

  deleteItem: async (table, id) => {
    set((s) => {
      const arr = getTable(s, table).filter((r) => r.id !== id)
      return { [table]: arr } as unknown as Partial<ConfigState>
    })
    await supabase.from('configuracion').delete().eq('id', id)
  },
}))
