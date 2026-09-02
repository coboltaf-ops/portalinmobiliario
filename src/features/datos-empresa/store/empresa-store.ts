import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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

export const useEmpresaStore = create<EmpresaState>()(persist((set, get) => ({
  empresa: null,
  loaded: false,
  fetchEmpresa: async () => {
    try {
      const { data } = await (supabase as any).from('empresa').select('*').limit(1).single()
      if (data) { set({ empresa: data, loaded: true }); return }
    } catch { /* sin backend disponible */ }
    // empresa es un objeto (no array): conserva lo persistido, solo marca loaded
    set({ loaded: true })
  },
  setEmpresa: async (e) => {
    set({ empresa: e })
    const { data: existing } = await (supabase as any).from('empresa').select('id').limit(1).single()
    if (existing) {
      await (supabase as any).from('empresa').update(e).eq('id', existing.id)
    } else {
      await (supabase as any).from('empresa').insert(e)
    }
  },
}), { name: 'portal-empresa-storage', storage: createJSONStorage(() => localStorage) }))
