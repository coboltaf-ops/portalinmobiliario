import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getCol, saveCol } from '@/shared/lib/cloud'

export type CorreoEnviado = {
  id: string
  fecha: string
  hora: string
  destinatario: string
  asunto: string
  mensaje: string
  consecutivo: string
  estado: string
}

interface CorreosState {
  correos: CorreoEnviado[]
  loaded: boolean
  fetchCorreos: () => Promise<void>
  addCorreo: (c: CorreoEnviado) => Promise<void>
  deleteCorreo: (id: string) => Promise<void>
}

export const useCorreosStore = create<CorreosState>()(persist((set, get) => ({
  correos: [],
  loaded: false,
  fetchCorreos: async () => {
    const data = await getCol<CorreoEnviado[]>('correos')
    if (Array.isArray(data) && data.length > 0) { set({ correos: data, loaded: true }); return }
    set({ loaded: true })
  },
  addCorreo: async (c) => {
    const arr = [c, ...get().correos]
    set({ correos: arr })
    await saveCol('correos', arr)
  },
  deleteCorreo: async (id) => {
    const arr = get().correos.filter((c) => c.id !== id)
    set({ correos: arr })
    await saveCol('correos', arr)
  },
}), { name: 'portal-correos-storage', storage: createJSONStorage(() => localStorage) }))
