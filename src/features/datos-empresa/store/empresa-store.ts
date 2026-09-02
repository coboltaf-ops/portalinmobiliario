import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'

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

export const useEmpresaStore = create<EmpresaState>()(persist((set) => ({
  empresa: null,
  loaded: false,
  fetchEmpresa: async () => {
    const data = await getCol<DatosEmpresa>('empresa')
    if (data && typeof data === 'object') { set({ empresa: data, loaded: true }); return }
    // empresa es un objeto (no array): conserva lo persistido, solo marca loaded
    set({ loaded: true })
  },
  setEmpresa: async (e) => {
    set({ empresa: e })
    await saveCol('empresa', e)
  },
}), { name: 'portal-empresa-storage', storage: createJSONStorage(() => localStorage) }))
