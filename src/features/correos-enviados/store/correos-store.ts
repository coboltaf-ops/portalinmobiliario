import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'

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

export const useCorreosStore = create<CorreosState>()((set, get) => ({
  correos: [],
  loaded: false,
  fetchCorreos: async () => {
    if (get().loaded) return
    const { data } = await supabase.from('correos_enviados').select('*').order('fecha', { ascending: false })
    if (data) set({ correos: data, loaded: true })
  },
  addCorreo: async (c) => {
    set((s) => ({ correos: [c, ...s.correos] }))
    await supabase.from('correos_enviados').insert(c)
  },
  deleteCorreo: async (id) => {
    set((s) => ({ correos: s.correos.filter((c) => c.id !== id) }))
    await supabase.from('correos_enviados').delete().eq('id', id)
  },
}))
