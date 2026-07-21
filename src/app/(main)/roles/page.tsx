'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRolesStore, type Rol } from '@/features/roles/store/roles-store'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import VoiceSearchButton from '@/shared/components/voice-search-button'
import { ModalHeader } from '@/shared/components/modal-header'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }
const textareaSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000', fontFamily: 'inherit' }

const initForm = (): Rol => ({
  id: '',
  nombre: '',
  descripcion: '',
})

export default function RolesPage() {
  const { roles, loaded, loading, error, fetchRoles, addRol, updateRol, deleteRol, clearError } = useRolesStore()
  const user = useAuthStore(s => s.user)
  const [form, setForm] = useState<Rol>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [viewRecord, setViewRecord] = useState<Rol | null>(null)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Verificar que es admin
  useEffect(() => {
    if (user?.rol !== 'Admin') {
      window.location.href = '/'
    }
  }, [user])

  // Cargar roles al montar
  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Mostrar errores del store
  useEffect(() => {
    if (error) {
      setFormError(error)
      clearError()
    }
  }, [error, clearError])

  const filtered = roles.filter(r =>
    r.nombre.toLowerCase().includes(search.toLowerCase()) ||
    r.descripcion.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')

    if (!form.nombre.trim()) {
      setFormError('El nombre del rol es obligatorio.')
      return
    }

    try {
      if (isEditing && form.id) {
        await updateRol(form.id, {
          nombre: form.nombre,
          descripcion: form.descripcion,
        })
        setSuccessMessage('Rol actualizado exitosamente')
      } else {
        await addRol({
          id: crypto.randomUUID(),
          nombre: form.nombre,
          descripcion: form.descripcion,
        })
        setSuccessMessage('Rol creado exitosamente')
      }

      setTimeout(() => {
        setIsFormOpen(false)
        setForm(initForm())
        setIsEditing(false)
        setSuccessMessage('')
      }, 1000)
    } catch (err) {
      setFormError('Error al guardar rol')
    }
  }

  const handleEdit = (r: Rol) => {
    setForm({ ...r })
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro que deseas eliminar este rol?')) {
      try {
        await deleteRol(id)
        setSuccessMessage('Rol eliminado exitosamente')
        setTimeout(() => setSuccessMessage(''), 2000)
      } catch (err) {
        setFormError('Error al eliminar rol')
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

  const headers = ['Nombre', 'Descripción']
  const rows = filtered.map(r => [r.nombre, r.descripcion || '-'])

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
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 7v5l4 2.5" />
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
          <h1 className="text-2xl font-bold text-white">Administración de Roles</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToPDF('Roles', headers, rows)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
              style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}
            >
              PDF
            </button>
            <button
              onClick={() => exportToExcel(filtered.map(r => ({ Nombre: r.nombre, Descripción: r.descripcion || '-' })), 'Roles')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
              style={{ background: 'rgba(22,163,74,0.85)', border: '1px solid rgba(22,163,74,1)', color: '#fff' }}
            >
              Excel
            </button>
            <button
              onClick={() => printTable('Roles', headers, rows)}
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
              + Nuevo Rol
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
            placeholder="Buscar roles..."
            className="flex-1 rounded-lg px-4 py-2 text-sm outline-none"
            style={inputSt}
          />
          <VoiceSearchButton onResult={setSearch} />
        </div>

        {/* Loading State */}
        {loading && !loaded && (
          <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Cargando roles...
          </div>
        )}

        {/* Table */}
        {loaded && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Nombre', 'Descripción', 'Acciones'].map(h => (
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
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3 font-semibold text-white">{r.nombre}</td>
                      <td className="px-4 py-3 text-white/80 max-w-xs truncate">{r.descripcion || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewRecord(r)}
                            className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                            style={{ background: '#ff9800', color: '#ffffff' }}
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleEdit(r)}
                            className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                            style={{ background: '#10b981', color: '#ffffff' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
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
                      <td colSpan={3} className="px-4 py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        No hay roles registrados
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
                <h2 className="text-lg font-bold text-black">{viewRecord.nombre}</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Nombre', value: viewRecord.nombre },
                  { label: 'Descripción', value: viewRecord.descripcion || '-' },
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
                  {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
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
                      Nombre *
                    </label>
                    <input
                      value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      placeholder="Nombre del rol"
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={inputSt}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      value={form.descripcion}
                      onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                      placeholder="Descripción del rol"
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                      rows={4}
                      style={textareaSt}
                    />
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
