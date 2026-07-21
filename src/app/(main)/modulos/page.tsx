'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useModulosStore, type Modulo } from '@/features/modulos/store/modulos-store'
import { useRolesStore } from '@/features/roles/store/roles-store'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import VoiceSearchButton from '@/shared/components/voice-search-button'
import { ModalHeader } from '@/shared/components/modal-header'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }
const textareaSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000', fontFamily: 'inherit' }
const selectSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

const initForm = (): Modulo => ({
  id: '',
  nombre: '',
  descripcion: '',
  url: '',
  estado: true,
  roles_permitidos: [],
})

export default function ModulosPage() {
  const { modulos, loaded, loading, error, fetchModulos, addModulo, updateModulo, deleteModulo, toggleModulo, clearError } = useModulosStore()
  const { roles, fetchRoles } = useRolesStore()
  const user = useAuthStore(s => s.user)
  const [form, setForm] = useState<Modulo>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [viewRecord, setViewRecord] = useState<Modulo | null>(null)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Verificar que es admin
  useEffect(() => {
    if (user?.rol !== 'Admin') {
      window.location.href = '/'
    }
  }, [user])

  // Cargar módulos y roles al montar
  useEffect(() => {
    fetchModulos()
    fetchRoles()
  }, [fetchModulos, fetchRoles])

  // Mostrar errores del store
  useEffect(() => {
    if (error) {
      setFormError(error)
      clearError()
    }
  }, [error, clearError])

  const filtered = modulos.filter(m =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    m.url?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')

    if (!form.nombre.trim()) {
      setFormError('El nombre del módulo es obligatorio.')
      return
    }

    try {
      if (isEditing && form.id) {
        await updateModulo(form.id, {
          nombre: form.nombre,
          descripcion: form.descripcion,
          url: form.url,
          estado: form.estado,
          roles_permitidos: form.roles_permitidos,
        })
        setSuccessMessage('Módulo actualizado exitosamente')
      } else {
        await addModulo({
          id: crypto.randomUUID(),
          nombre: form.nombre,
          descripcion: form.descripcion,
          url: form.url,
          estado: form.estado,
          roles_permitidos: form.roles_permitidos,
        })
        setSuccessMessage('Módulo creado exitosamente')
      }

      setTimeout(() => {
        setIsFormOpen(false)
        setForm(initForm())
        setIsEditing(false)
        setSuccessMessage('')
      }, 1000)
    } catch (err) {
      setFormError('Error al guardar módulo')
    }
  }

  const handleEdit = (m: Modulo) => {
    setForm({ ...m })
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro que deseas eliminar este módulo?')) {
      try {
        await deleteModulo(id)
        setSuccessMessage('Módulo eliminado exitosamente')
        setTimeout(() => setSuccessMessage(''), 2000)
      } catch (err) {
        setFormError('Error al eliminar módulo')
      }
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleModulo(id)
    } catch (err) {
      setFormError('Error al cambiar estado del módulo')
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

  const toggleRolPermitido = (rolId: string) => {
    setForm(f => {
      const rolesActuales = f.roles_permitidos || []
      if (rolesActuales.includes(rolId)) {
        return {
          ...f,
          roles_permitidos: rolesActuales.filter(r => r !== rolId),
        }
      } else {
        return {
          ...f,
          roles_permitidos: [...rolesActuales, rolId],
        }
      }
    })
  }

  const getRolNombre = (rolId: string) => {
    return roles.find(r => r.id === rolId)?.nombre || rolId
  }

  const headers = ['Nombre', 'Descripción', 'URL', 'Estado', 'Roles Asignados']
  const rows = filtered.map(m => [
    m.nombre,
    m.descripcion || '-',
    m.url || '-',
    m.estado ? 'ON' : 'OFF',
    m.roles_permitidos?.length > 0 ? m.roles_permitidos.map(r => getRolNombre(r)).join(', ') : '-',
  ])

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
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
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
          <h1 className="text-2xl font-bold text-white">Administración de Módulos del Sistema</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToPDF('Módulos del Sistema', headers, rows)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
              style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}
            >
              PDF
            </button>
            <button
              onClick={() => exportToExcel(filtered.map(m => ({
                Nombre: m.nombre,
                Descripción: m.descripcion || '-',
                URL: m.url || '-',
                Estado: m.estado ? 'Activo' : 'Inactivo',
                'Roles Asignados': m.roles_permitidos?.length > 0 ? m.roles_permitidos.map(r => getRolNombre(r)).join(', ') : '-',
              })), 'Módulos')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
              style={{ background: 'rgba(22,163,74,0.85)', border: '1px solid rgba(22,163,74,1)', color: '#fff' }}
            >
              Excel
            </button>
            <button
              onClick={() => printTable('Módulos del Sistema', headers, rows)}
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
              + Nuevo Módulo
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
            placeholder="Buscar módulos..."
            className="flex-1 rounded-lg px-4 py-2 text-sm outline-none"
            style={inputSt}
          />
          <VoiceSearchButton onResult={setSearch} />
        </div>

        {/* Loading State */}
        {loading && !loaded && (
          <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Cargando módulos...
          </div>
        )}

        {/* Table */}
        {loaded && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {['Nombre', 'Descripción', 'URL', 'Estado', 'Roles Asignados', 'Acciones'].map(h => (
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
                  {filtered.map(m => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3 font-semibold text-white">{m.nombre}</td>
                      <td className="px-4 py-3 text-white/80 max-w-xs truncate">{m.descripcion || '-'}</td>
                      <td className="px-4 py-3 text-white/70 max-w-xs truncate font-mono text-xs">{m.url || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(m.id)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: m.estado ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)',
                            color: m.estado ? '#22c55e' : '#6b7280',
                            border: m.estado ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(107,114,128,0.4)',
                          }}
                        >
                          {m.estado ? 'ON' : 'OFF'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-white/70 text-xs max-w-xs truncate">
                        {m.roles_permitidos?.length > 0
                          ? m.roles_permitidos.map(r => getRolNombre(r)).join(', ')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewRecord(m)}
                            className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                            style={{ background: '#ff9800', color: '#ffffff' }}
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleEdit(m)}
                            className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                            style={{ background: '#10b981', color: '#ffffff' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
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
                      <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        No hay módulos registrados
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
                  { label: 'URL/Ruta', value: viewRecord.url || '-' },
                  { label: 'Estado', value: viewRecord.estado ? 'Activo (ON)' : 'Inactivo (OFF)' },
                  {
                    label: 'Roles Permitidos',
                    value: viewRecord.roles_permitidos?.length > 0
                      ? viewRecord.roles_permitidos.map(r => getRolNombre(r)).join(', ')
                      : '-',
                  },
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
          <div className="w-full max-w-2xl rounded-2xl overflow-y-auto max-h-[90vh]" style={{ background: '#ffffff', border: '2px solid #000000' }}>
            <ModalHeader onClose={handleCloseForm} userName={user?.usuario} userRole={user?.rol} />
            <div className="px-6 py-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-black">
                  {isEditing ? 'Editar Módulo' : 'Nuevo Módulo'}
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
                      placeholder="Nombre del módulo"
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
                      placeholder="Descripción del módulo"
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                      rows={3}
                      style={textareaSt}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      URL/Ruta
                    </label>
                    <input
                      value={form.url}
                      onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                      placeholder="/ruta/del/modulo"
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={inputSt}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">
                      Estado
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.05)' }}>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, estado: true }))}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: form.estado ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.05)',
                          color: form.estado ? '#22c55e' : '#6b7280',
                          border: form.estado ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(0,0,0,0.1)',
                        }}
                      >
                        Activo (ON)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, estado: false }))}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: !form.estado ? 'rgba(107,114,128,0.2)' : 'rgba(0,0,0,0.05)',
                          color: !form.estado ? '#6b7280' : '#6b7280',
                          border: !form.estado ? '1px solid rgba(107,114,128,0.4)' : '1px solid rgba(0,0,0,0.1)',
                        }}
                      >
                        Inactivo (OFF)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-700">
                      Roles Permitidos
                    </label>
                    <div className="space-y-2 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.05)' }}>
                      {roles.length > 0 ? (
                        roles.map(rol => (
                          <div key={rol.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`rol-${rol.id}`}
                              checked={(form.roles_permitidos || []).includes(rol.id)}
                              onChange={() => toggleRolPermitido(rol.id)}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <label
                              htmlFor={`rol-${rol.id}`}
                              className="text-sm text-gray-700 cursor-pointer flex-1"
                            >
                              {rol.nombre}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No hay roles disponibles. Crea roles primero.</p>
                      )}
                    </div>
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
