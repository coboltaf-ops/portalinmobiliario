import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'
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
    const data = await getCol<Cliente[]>('clientes')
    if (Array.isArray(data) && data.length > 0) { set({ clientes: data, loaded: true }); return }
    if (get().clientes.length === 0) set({ clientes: demoClientes, loaded: true })
    else set({ loaded: true })
  },
  addCliente: async (c) => {
    const arr = [...get().clientes, c]
    set({ clientes: arr })
    await saveCol('clientes', arr)
  },
  updateCliente: async (id, c) => {
    const arr = get().clientes.map((r) => r.id === id ? { ...r, ...c } : r)
    set({ clientes: arr })
    await saveCol('clientes', arr)
  },
  deleteCliente: async (id) => {
    const arr = get().clientes.filter((r) => r.id !== id)
    set({ clientes: arr })
    await saveCol('clientes', arr)
  },
}), { name: 'portal-clientes-storage', storage: createJSONStorage(() => localStorage) }))
