import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/shared/lib/supabase'
import { demoClientes } from '../demo-clientes'

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
  ciudad_deseada: string
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

export const useClientesStore = create<ClientesState>()(persist((set, get) => ({
  clientes: [],
  loaded: false,
  fetchClientes: async () => {
    try {
      const { data } = await (supabase as any).from('clientes').select('*')
      if (data && data.length > 0) { set({ clientes: data, loaded: true }); return }
    } catch { /* sin backend disponible */ }
    if (get().clientes.length === 0) set({ clientes: demoClientes, loaded: true })
    else set({ loaded: true })
  },
  addCliente: async (c) => {
    set((s) => ({ clientes: [...s.clientes, c] }))
    await (supabase as any).from('clientes').insert(c)
  },
  updateCliente: async (id, c) => {
    set((s) => ({ clientes: s.clientes.map((r) => r.id === id ? { ...r, ...c } : r) }))
    await (supabase as any).from('clientes').update(c).eq('id', id)
  },
  deleteCliente: async (id) => {
    set((s) => ({ clientes: s.clientes.filter((r) => r.id !== id) }))
    await (supabase as any).from('clientes').delete().eq('id', id)
  },
}), { name: 'portal-clientes-storage', storage: createJSONStorage(() => localStorage) }))
