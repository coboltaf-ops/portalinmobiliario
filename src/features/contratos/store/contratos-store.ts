import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'
import { demoContratos } from '../demo-contratos'

export type Documento = {
  id: string
  nombre: string
  tipo: string
  fecha: string
  data: string
}

export type Contrato = {
  id: string
  nro_contrato: string
  tipo: string
  fecha: string
  cliente_id: string
  propiedad_id: string
  comercial_id: string
  tipo_moneda: string
  monto: number
  plazo: number
  fecha_inicio: string
  fecha_fin: string
  condiciones: string
  observaciones: string
  situacion: string
  imagen?: string
  documentos: Documento[]
}

interface ContratosState {
  contratos: Contrato[]
  loaded: boolean
  fetchContratos: () => Promise<void>
  addContrato: (c: Contrato) => Promise<void>
  updateContrato: (id: string, c: Partial<Contrato>) => Promise<void>
  deleteContrato: (id: string) => Promise<void>
}

export const useContratosStore = create<ContratosState>()(persist((set, get) => ({
  contratos: [],
  loaded: false,
  fetchContratos: async () => {
    const data = await getCol<Record<string, unknown>[]>('contratos')
    if (Array.isArray(data) && data.length > 0) {
      const contratos = data.map((c) => ({
        ...c,
        documentos: (c.documentos as Documento[]) || [],
      })) as Contrato[]
      set({ contratos, loaded: true })
      return
    }
    if (get().contratos.length === 0) set({ contratos: demoContratos, loaded: true })
    else set({ loaded: true })
  },
  addContrato: async (c) => {
    const arr = [...get().contratos, c]
    set({ contratos: arr })
    await saveCol('contratos', arr)
  },
  updateContrato: async (id, c) => {
    const arr = get().contratos.map((r) => r.id === id ? { ...r, ...c } : r)
    set({ contratos: arr })
    await saveCol('contratos', arr)
  },
  deleteContrato: async (id) => {
    const arr = get().contratos.filter((r) => r.id !== id)
    set({ contratos: arr })
    await saveCol('contratos', arr)
  },
}), { name: 'portal-contratos-storage', storage: createJSONStorage(() => localStorage) }))
