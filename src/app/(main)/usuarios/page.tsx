'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useUsuariosStore, type Usuario } from '@/features/usuarios/store/usuarios-store'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import VoiceSearchButton from '@/shared/components/voice-search-button'
import { ModalHeader } from '@/shared/components/modal-header'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }
const selectSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

const initForm = (): Usuario => ({
  id: '',
  usuario: '',
  nombre: '',
  clave: '',
  rol: 'User',
})

export default function UsuariosPage() {
  const { usuarios, loaded, loading, error, fetchUsuarios, addUsuario, updateUsuario, deleteUsuario, clearError } = useUsuariosStore()
  const user = useAuthStore(s => s.user)
  const [form, setForm] = useState<Usuario>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [viewRecord, setViewRecord] = useState<Usuario | null>(null)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Verificar que es admin
  useEffect(() => {
    if (user?.rol !== 'Admin') {
      window.location.href = '/'
    }
  }, [user])

  // Cargar usuarios al montar
  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

  // Mostrar errores del store
  useEffect(() => {
    if (error) {
      setFormError(error)
      clearError()
    }
  }, [error, clearError])

  const filtered = usuarios.filter(u =>
    u.usuario.toLowerCase().includes(search.toLowerCase()) ||
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.rol.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')

    if (!form.usuario.trim()) {
      setFormError('El usuario es obligatorio.')
      return
    }
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio.')
      return
    }
    if (!form.rol) {
      setFormError('El rol es obligatorio.')
      return
    }

    // Validar clave solo si es nuevo usuario
    if (!isEditing && !form.clave?.trim()) {
      setFormError('La clave es obligatoria para nuevos usuarios.')
      return
    }

    try {
      if (isEditing && form.id) {
        // Editar: no incluir clave si está vacía
        const updateData: Partial<Usuario> = {
          usuario: form.usuario,
          nombre: form.nombre,
          rol: form.rol,
        }
        if (form.clave?.trim()) {
          updateData.clave = form.clave
        }
        await updateUsuario(form.id, updateData)
        setSuccessMessage('Usuario actualizado exitosamente')
      } else {
        // Crear
        await addUsuario({
          id: crypto.randomUUID(),
          usuario: form.usuario,
          nombre: form.nombre,
          clave: form.clave,
          rol: form.rol,
        })
        setSuccessMessage('Usuario creado exitosamente')
      }

      setTimeout(() => {
        setIsFormOpen(false)
        setForm(initForm())
        setIsEditing(false)
        setSuccessMessage('')
      }, 1000)
    } catch (err) {
      setFormError('Error al guardar usuario')
    }
  }

  const handleEdit = (u: Usuario) => {
    setForm({ ...u, clave: '' })
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro que deseas eliminar este usuario?')) {
      try {
        await deleteUsuario(id)
        setSuccessMessage('Usuario eliminado exitosamente')
        setTimeout(() => setSuccessMessage(''), 2000)
      } catch (err) {
        setFormError('Error al eliminar usuario')
      }
    }
  }

  const handleOpenForm = () => {
    setForm(initForm())
    setIsEditing(false)
    setFormError('')
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setForm(initForm())
    setIsEditing(false)
    setFormError('')
  }

  const rolBadge = (rol: string) => {
    const isAdmin = rol === 'Admin'
    return (
      <span
        className="px-2 py-1 rounded-lg text-xs font-semibold"
        style={{
          background: isAdmin ? 'rgba(30,64,175,0.2)' : 'rgba(107,114,128,0.2)',
          color: isAdmin ? '#3b82f6' : '#6b7280',
          border: isAdmin ? '1px solid rgba(30,64,175,0.3)' : '1px solid rgba(107,114,128,0.3)',
        }}
      >
        {rol}
      </span>
    )
  }

  const headers = ['Usuario', 'Nombre', 'Rol']
  const rows = filtered.map(u => [u.usuario, u.nombre, u.rol])

  if (user?.rol !== 'Admin') {
    return null
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4" style={{ background: '#001e4d' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#2563eb' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff', margin: 0 }}>
            PORTAL INMOBILIARIO
          </h1>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color: '#ffffff', margin: 0 }}>
            {user?.usuario}
          </p>
          <p className="text-sm" style={{ color: '#ffffff', margin: 0 }}>
            {user?.rol}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Administración de Usuarios</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToPDF('Usuarios', headers, rows)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
              style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}
            >
              PDF
            </button>
            <button
              onClick={() => exportToExcel(filtered.map(u => ({ Usuario: u.usuario, Nombre: u.nombre, Rol: u.rol })), 'Usuarios')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
              style={{ background: 'rgba(22,163,74,0.85)', border: '1px solid rgba(22,163,74,1)', color: '#fff' }}
            >
              Excel
            </button>
            <button
              onClick={() => printTable('Usuarios', headers, rows)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
              style={{ background: 'rgba(202,138,4,0.9)', border: '1px solid rgba(202,138,4,1)', color: '#fff' }}
            >
              Imprimir
            </button>
            <button
              onClick={handleOpenForm}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}
            >
              + Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534' }}
          >
            {successMessage}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuarios..."
            className="flex-1 rounded-lg px-4 py-2 text-sm outline-none"
            style={inputSt}
          />
          <VoiceSearchButton onResult={setSearch} />
        </div>

        {/* Loading State */}
        {loading && !loaded && (
          <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Cargando usuarios...
          </div>
        )}

        {/* Table */}
        {loaded && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Usuario', 'Nombre', 'Rol', 'Acciones'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold"
                        style={{ color: 'rgba(255,255,255,0.5)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3 font-mono text-sm text-white/80">{u.usuario}</td>
                      <td className="px-4 py-3 text-white">{u.nombre}</td>
                      <td className="px-4 py-3">{rolBadge(u.rol)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewRecord(u)}
                            className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                            style={{ background: '#ff9800', color: '#ffffff' }}
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleEdit(u)}
                            className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                            style={{ background: '#10b981', color: '#ffffff' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                            style={{ background: '#ef4444', color: '#ffffff' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        No hay usuarios registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl rounded-2xl" style={{ background: '#ffffff', border: '2px solid #000000' }}>
            <ModalHeader onClose={() => setViewRecord(null)} userName={user?.usuario} userRole={user?.rol} />
            <div className="px-6 py-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-black">{viewRecord.usuario}</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Usuario', value: viewRecord.usuario },
                  { label: 'Nombre', value: viewRecord.nombre },
                  { label: 'Rol', value: viewRecord.rol },
                  { label: 'Creado', value: viewRecord.created_at ? new Date(viewRecord.created_at).toLocaleDateString() : '-' },
                ].map(f => (
                  <div key={f.label} style={{ border: '2px solid #000000', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <p className="text-xs text-gray-600">{f.label}</p>
                    <p className="text-sm text-black font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl rounded-2xl" style={{ background: '#ffffff', border: '2px solid #000000' }}>
            <ModalHeader onClose={handleCloseForm} userName={user?.usuario} userRole={user?.rol} />
            <div className="px-6 py-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-black">
                  {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
              </div>

              {formError && (
                <div
                  className="mb-4 px-4 py-3 rounded-xl text-sm"
                  style={{ background: '#ffebee', border: '1px solid #ef5350', color: '#c62828' }}
                >
                  {formError}
                </div>
              )}

              {successMessage && (
                <div
                  className="mb-4 px-4 py-3 rounded-xl text-sm"
                  style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534' }}
                >
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      Usuario *
                    </label>
                    <input
                      value={form.usuario}
                      onChange={e => setForm(f => ({ ...f, usuario: e.target.value }))}
                      disabled={isEditing}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={{
                        ...inputSt,
                        opacity: isEditing ? 0.6 : 1,
                        cursor: isEditing ? 'not-allowed' : 'auto',
                      }}
                    />
                    {isEditing && <p className="text-xs text-gray-500 mt-1">No se puede cambiar el usuario</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      Nombre *
                    </label>
                    <input
                      value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={inputSt}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      Clave {!isEditing ? '*' : '(dejar vacío para no cambiar)'}
                    </label>
                    <input
                      type="password"
                      value={form.clave}
                      onChange={e => setForm(f => ({ ...f, clave: e.target.value }))}
                      placeholder={isEditing ? 'Dejar vacío para mantener la clave actual' : 'Ingresa la clave'}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={inputSt}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      Rol *
                    </label>
                    <select
                      value={form.rol}
                      onChange={e => setForm(f => ({ ...f, rol: e.target.value as 'Admin' | 'User' }))}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={selectSt}
                    >
                      <option value="">Seleccionar rol...</option>
                      <option value="Admin">Admin</option>
                      <option value="User">User</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-2 rounded-lg text-sm font-semibold text-black"
                    style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.2)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}
                  >
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
