import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/shared/lib/supabase'

export type Usuario = {
  id: string
  usuario: string
  nombre: string
  clave?: string
  rol: 'Admin' | 'User'
  created_at?: string
}

interface UsuariosState {
  usuarios: Usuario[]
  loaded: boolean
  loading: boolean
  error: string | null
  fetchUsuarios: () => Promise<void>
  addUsuario: (u: Usuario) => Promise<void>
  updateUsuario: (id: string, u: Partial<Usuario>) => Promise<void>
  deleteUsuario: (id: string) => Promise<void>
  clearError: () => void
}

export const useUsuariosStore = create<UsuariosState>()(persist((set, get) => ({
  usuarios: [],
  loaded: false,
  loading: false,
  error: null,

  fetchUsuarios: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await (supabase as any)
        .from('usuarios')
        .select('id, usuario, nombre, rol, created_at')
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        set({ usuarios: data, loaded: true, loading: false })
        return
      }
    } catch { /* sin backend disponible */ }
    // Conserva lo persistido en localStorage cuando no hay backend
    set({ loaded: true, loading: false })
  },

  addUsuario: async (u) => {
    set({ error: null })
    try {
      // Preparar datos sin incluir clave en la respuesta
      const { clave, ...dataToInsert } = u
      const dataToInsertWithClave = { ...dataToInsert, clave: u.clave || '' }

      const { error: supabaseError } = await (supabase as any)
        .from('usuarios')
        .insert(dataToInsertWithClave)

      if (supabaseError) {
        set({ error: `Error al crear usuario: ${supabaseError.message}` })
        return
      }

      // Agregar a lista local sin la clave
      const newUsuario: Usuario = {
        id: u.id,
        usuario: u.usuario,
        nombre: u.nombre,
        rol: u.rol,
        created_at: new Date().toISOString(),
      }
      set((s) => ({ usuarios: [newUsuario, ...s.usuarios] }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  updateUsuario: async (id, u) => {
    set({ error: null })
    try {
      // No permitir actualizar la clave mediante update (solo en creación)
      const { clave, ...dataToUpdate } = u

      const { error: supabaseError } = await (supabase as any)
        .from('usuarios')
        .update(dataToUpdate)
        .eq('id', id)

      if (supabaseError) {
        set({ error: `Error al actualizar usuario: ${supabaseError.message}` })
        return
      }

      set((s) => ({
        usuarios: s.usuarios.map((usr) =>
          usr.id === id ? { ...usr, ...dataToUpdate } : usr
        ),
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  deleteUsuario: async (id) => {
    set({ error: null })
    try {
      const { error: supabaseError } = await (supabase as any)
        .from('usuarios')
        .delete()
        .eq('id', id)

      if (supabaseError) {
        set({ error: `Error al eliminar usuario: ${supabaseError.message}` })
        return
      }

      set((s) => ({
        usuarios: s.usuarios.filter((usr) => usr.id !== id),
      }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ error: `Error: ${message}` })
    }
  },

  clearError: () => set({ error: null }),
}), { name: 'portal-usuarios-storage', storage: createJSONStorage(() => localStorage) }))
