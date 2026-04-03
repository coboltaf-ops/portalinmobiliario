import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

export type DatosEmpresa = {
  id: string
  nombre: string
  tipo_identificacion: string
  nro_documento: string
  correo: string
  telefono: string
  direccion: string
  ciudad: string
  pais: string
  representante_legal: string
  logo: string
  imagen?: string
}

interface EmpresaState {
  empresa: DatosEmpresa | null
  loaded: boolean
  fetchEmpresa: () => Promise<void>
  setEmpresa: (e: DatosEmpresa) => Promise<void>
}

export const useEmpresaStore = create<EmpresaState>()((set, get) => ({
  empresa: null,
  loaded: false,
  fetchEmpresa: async () => {

    const { data } = await supabase.from('empresa').select('*').limit(1).single()
    set({ empresa: data ?? null, loaded: true })
  },
  setEmpresa: async (e) => {
    set({ empresa: e })
    const { data: existing } = await supabase.from('empresa').select('id').limit(1).single()
    if (existing) {
      await supabase.from('empresa').update(e).eq('id', existing.id)
    } else {
      await supabase.from('empresa').insert(e)
    }
  },
}))
