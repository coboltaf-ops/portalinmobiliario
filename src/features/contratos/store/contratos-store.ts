import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

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

export const useContratosStore = create<ContratosState>()((set, get) => ({
  contratos: [],
  loaded: false,
  fetchContratos: async () => {

    const { data } = await (supabase as any).from('contratos').select('*')
    if (data) {
      const contratos = data.map((c: Record<string, unknown>) => ({
        ...c,
        documentos: (c.documentos as Documento[]) || [],
      })) as Contrato[]
      set({ contratos, loaded: true })
    }
  },
  addContrato: async (c) => {
    set((s) => ({ contratos: [...s.contratos, c] }))
    await (supabase as any).from('contratos').insert(c)
  },
  updateContrato: async (id, c) => {
    set((s) => ({ contratos: s.contratos.map((r) => r.id === id ? { ...r, ...c } : r) }))
    await (supabase as any).from('contratos').update(c).eq('id', id)
  },
  deleteContrato: async (id) => {
    set((s) => ({ contratos: s.contratos.filter((r) => r.id !== id) }))
    await (supabase as any).from('contratos').delete().eq('id', id)
  },
}))
