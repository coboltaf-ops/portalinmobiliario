import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

export type Cliente = {
  id: string
  codigo: string
  nombre: string
  apellido: string
  correo: string
  telefono: string
  movil: string
  tipo: string
  interes: string
  presupuesto_min: number
  presupuesto_max: number
  tipo_moneda: string
  zona_preferida: string
  tipo_propiedad_buscada: string
  asesor_asignado: string
  observaciones: string
  situacion: string
  imagen?: string
}

interface ClientesState {
  clientes: Cliente[]
  loaded: boolean
  fetchClientes: () => Promise<void>
  addCliente: (c: Cliente) => Promise<void>
  updateCliente: (id: string, c: Partial<Cliente>) => Promise<void>
  deleteCliente: (id: string) => Promise<void>
}

export const useClientesStore = create<ClientesState>()((set, get) => ({
  clientes: [],
  loaded: false,
  fetchClientes: async () => {
    if (get().loaded) return
    const { data } = await supabase.from('clientes').select('*')
    if (data) set({ clientes: data, loaded: true })
  },
  addCliente: async (c) => {
    set((s) => ({ clientes: [...s.clientes, c] }))
    await supabase.from('clientes').insert(c)
  },
  updateCliente: async (id, c) => {
    set((s) => ({ clientes: s.clientes.map((r) => r.id === id ? { ...r, ...c } : r) }))
    await supabase.from('clientes').update(c).eq('id', id)
  },
  deleteCliente: async (id) => {
    set((s) => ({ clientes: s.clientes.filter((r) => r.id !== id) }))
    await supabase.from('clientes').delete().eq('id', id)
  },
}))
