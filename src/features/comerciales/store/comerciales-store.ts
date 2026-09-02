import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'

export type Comercial = {
  id: string
  codigo: string
  nombre: string
  apellido: string
  correo: string
  telefono: string
  movil: string
  cargo: string
  departamento: string
  zona_asignada: string
  foto: string
  situacion: string
}

interface ComercialesState {
  comerciales: Comercial[]
  loaded: boolean
  fetchComerciales: () => Promise<void>
  addComercial: (c: Comercial) => Promise<void>
  updateComercial: (id: string, c: Partial<Comercial>) => Promise<void>
  deleteComercial: (id: string) => Promise<void>
}

export const useComercialesStore = create<ComercialesState>()(persist((set, get) => ({
  comerciales: [],
  loaded: false,
  fetchComerciales: async () => {
    const data = await getCol<Comercial[]>('comerciales')
    if (Array.isArray(data) && data.length > 0) { set({ comerciales: data, loaded: true }); return }
    set({ loaded: true })
  },
  addComercial: async (c) => {
    const arr = [...get().comerciales, c]
    set({ comerciales: arr })
    await saveCol('comerciales', arr)
  },
  updateComercial: async (id, c) => {
    const arr = get().comerciales.map((r) => r.id === id ? { ...r, ...c } : r)
    set({ comerciales: arr })
    await saveCol('comerciales', arr)
  },
  deleteComercial: async (id) => {
    const arr = get().comerciales.filter((r) => r.id !== id)
    set({ comerciales: arr })
    await saveCol('comerciales', arr)
  },
}), { name: 'portal-comerciales-storage', storage: createJSONStorage(() => localStorage) }))
