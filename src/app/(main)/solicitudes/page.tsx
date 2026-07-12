'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSolicitudesStore, type Solicitud } from '@/features/solicitudes/store/solicitudes-store'
import { usePropiedadesStore } from '@/features/propiedades/store/propiedades-store'
import { useComercialesStore } from '@/features/comerciales/store/comerciales-store'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { useConfigStore } from '@/features/configuracion/store/configuracion-store'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { fmtNum } from '@/shared/lib/format-date'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import VoiceSearchButton from '@/shared/components/voice-search-button'
import { ModalHeader } from '@/shared/components/modal-header'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }
const selectSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

const initForm = (): Solicitud => ({
  id: '', codigo: '', fecha: '', nombre: '', apellido: '', correo: '', telefono: '',
  mensaje: '', origen: '', propiedad_id: '', estado: 'Nueva', comercial_asignado: '', notas: '',
})

export default function SolicitudesPage() {
  const router = useRouter()
  const { solicitudes, addSolicitud, updateSolicitud, deleteSolicitud } = useSolicitudesStore()
  const propiedades = usePropiedadesStore(s => s.propiedades)
  const comerciales = useComercialesStore(s => s.comerciales)
  const { clientes, addCliente } = useClientesStore()
  const config = useConfigStore()
  const user = useAuthStore(s => s.user)

  const monedaSimbolo = (code: string) => {
    const m = config.monedas.find(m => m.nombre === code)
    return m ? m.simbolo : '$'
  }

  const [form, setForm] = useState<Solicitud>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState<Solicitud | null>(null)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')

  const propSeleccionada = propiedades.find(p => p.id === form.propiedad_id)

  const nextCode = () => {
    const nums = solicitudes.map(s => parseInt(s.codigo.replace('SOL-', '')) || 0)
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `SOL-${String(max + 1).padStart(5, '0')}`
  }

  const todayFormatted = () => {
    const d = new Date()
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  const filtered = solicitudes.filter(s =>
    s.codigo.toLowerCase().includes(search.toLowerCase()) ||
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    s.apellido.toLowerCase().includes(search.toLowerCase()) ||
    s.correo.toLowerCase().includes(search.toLowerCase()) ||
    s.estado.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.nombre.trim()) { setFormError('El nombre es obligatorio.'); return }
    if (!form.correo.trim() && !form.telefono.trim()) { setFormError('Debe ingresar correo o telefono.'); return }
    if (!form.propiedad_id) { setFormError('Debe seleccionar una propiedad.'); return }
    if (form.id) {
      updateSolicitud(form.id, form)
    } else {
      addSolicitud({ ...form, id: crypto.randomUUID(), codigo: nextCode(), fecha: todayFormatted() })
    }
    setIsFormOpen(false)
    setForm(initForm())
  }

  const handleEdit = (s: Solicitud) => { setForm({ ...s }); setIsFormOpen(true) }
  const handleDelete = (id: string) => { if (confirm('¿Eliminar esta solicitud?')) deleteSolicitud(id) }

  const handleAtender = (s: Solicitud) => {
    updateSolicitud(s.id, { estado: 'En Atencion' })
  }

  const handleConvertirCliente = (s: Solicitud) => {
    const existe = clientes.find(c => c.correo && c.correo.toLowerCase() === s.correo.toLowerCase())
    if (existe) { alert(`Ya existe un cliente con este correo: ${existe.codigo} - ${existe.nombre} ${existe.apellido}`); return }
    if (!confirm(`¿Convertir a ${s.nombre} ${s.apellido} en Cliente/Prospecto?`)) return

    const nums = clientes.map(c => parseInt(c.codigo.replace('CLI-', '')) || 0)
    const max = nums.length > 0 ? Math.max(...nums) : 0
    const nuevoCodigo = `CLI-${String(max + 1).padStart(5, '0')}`

    const prop = propiedades.find(p => p.id === s.propiedad_id)

    addCliente({
      id: crypto.randomUUID(),
      codigo: nuevoCodigo,
      nombre: s.nombre,
      apellido: s.apellido,
      correo: s.correo,
      telefono: s.telefono,
      movil: s.telefono,
      tipo: 'Prospecto',
      interes: prop?.modalidad === 'Alquiler' ? 'Alquiler' : 'Compra',
      presupuesto_min: 0,
      presupuesto_max: prop?.precio_venta || prop?.precio_alquiler || 0,
      tipo_moneda: prop?.tipo_moneda || 'USD',
      ciudad_deseada: prop?.ciudad || '',
      zona_preferida: prop?.zona || '',
      tipo_propiedad_buscada: prop?.tipo_propiedad || '',
      asesor_asignado: s.comercial_asignado,
      observaciones: `Viene de Solicitud ${s.codigo} - Origen: ${s.origen}. ${s.mensaje}`,
      situacion: 'Activo',
      imagen: '',
    })
    updateSolicitud(s.id, { estado: 'Atendida', notas: `${s.notas}\n[${todayFormatted()}] Convertido a Cliente ${nuevoCodigo}` })
    alert(`Cliente creado: ${nuevoCodigo}`)
  }

  const handleCotizar = (s: Solicitud) => {
    updateSolicitud(s.id, { estado: 'En Atencion' })
    router.push('/cotizaciones')
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, { bg: string; color: string; border: string }> = {
      'Nueva': { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' },
      'En Atencion': { bg: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' },
      'Atendida': { bg: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' },
      'Descartada': { bg: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
    }
    const c = colors[s] || { bg: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }
    return <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: c.bg, color: c.color, border: c.border }}>{s}</span>
  }

  const nuevasCount = solicitudes.filter(s => s.estado === 'Nueva').length

  const headers = ['Codigo', 'Fecha', 'Nombre', 'Correo', 'Telefono', 'Origen', 'Propiedad', 'Estado', 'Comercial']
  const rows = filtered.map(s => {
    const prop = propiedades.find(p => p.id === s.propiedad_id)
    const com = comerciales.find(c => c.id === s.comercial_asignado)
    return [s.codigo, s.fecha, `${s.nombre} ${s.apellido}`, s.correo, s.telefono, s.origen || '-',
      prop ? `${prop.codigo} - ${prop.urbanizacion}` : '-', s.estado,
      com ? `${com.nombre} ${com.apellido}` : 'Sin asignar']
  })

  return (
    <>
      {/* Header with Logo and Title */}
      <div className="flex items-center gap-4 px-8 py-4" style={{ background: '#001e4d' }}>
        <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#2563eb' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">PORTAL INMOBILIARIO</h1>
      </div>

      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Solicitudes</h1>
          {nuevasCount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(245,158,11,0.85)', color: '#fff' }}>{nuevasCount} nueva{nuevasCount > 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToPDF('Solicitudes', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}>PDF</button>
          <button onClick={() => exportToExcel(filtered.map(s => { const prop = propiedades.find(p => p.id === s.propiedad_id); return { Codigo: s.codigo, Fecha: s.fecha, Nombre: s.nombre, Apellido: s.apellido, Correo: s.correo, Telefono: s.telefono, Propiedad: prop ? prop.urbanizacion : '-', Estado: s.estado } }), 'Solicitudes')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(22,163,74,0.85)', border: '1px solid rgba(22,163,74,1)', color: '#fff' }}>Excel</button>
          <button onClick={() => printTable('Solicitudes', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(202,138,4,0.9)', border: '1px solid rgba(202,138,4,1)', color: '#fff' }}>Imprimir</button>
          <button onClick={() => { setForm(initForm()); setIsFormOpen(true) }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>+ Nueva Solicitud</button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar solicitudes..." className="flex-1 rounded-lg px-4 py-2 text-sm outline-none" style={inputSt} />
        <VoiceSearchButton onResult={setSearch} />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Codigo', 'Fecha', 'Nombre', 'Origen', 'Propiedad', 'Estado', 'Comercial', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const prop = propiedades.find(p => p.id === s.propiedad_id)
                const com = comerciales.find(c => c.id === s.comercial_asignado)
                return (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{s.codigo}</td>
                    <td className="px-4 py-3 text-white/70">{s.fecha}</td>
                    <td className="px-4 py-3 text-white">{s.nombre} {s.apellido}</td>
                    <td className="px-4 py-3 text-white/70">{s.origen || '-'}</td>
                    <td className="px-4 py-3 text-white/70">{prop ? `${prop.codigo}` : '-'}</td>
                    <td className="px-4 py-3">{statusBadge(s.estado)}</td>
                    <td className="px-4 py-3 text-white/70">{com ? `${com.nombre} ${com.apellido}` : 'Sin asignar'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewRecord(s)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: '#ff9800', color: '#ffffff' }}>Ver</button>
                        <button onClick={() => handleEdit(s)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: '#10b981', color: '#ffffff' }}>Editar</button>
                        <button onClick={() => handleDelete(s.id)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: '#ef4444', color: '#ffffff' }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-white/30">No hay solicitudes registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewRecord && (() => {
        const prop = propiedades.find(p => p.id === viewRecord.propiedad_id)
        const com = comerciales.find(c => c.id === viewRecord.comercial_asignado)
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="w-full max-w-6xl h-screen flex flex-col rounded-2xl" style={{ background: '#ffffff', border: '2px solid #000000' }}>
              <ModalHeader onClose={() => setViewRecord(null)} />
              <div className="text-center py-4" style={{ background: '#001e4d', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <p className="text-lg font-bold" style={{ color: '#ffffff' }}>{user?.usuario}</p>
                <p className="text-sm" style={{ color: '#ffffff' }}>{user?.rol}</p>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-black">{viewRecord.codigo} - Solicitud</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Codigo', value: viewRecord.codigo },
                  { label: 'Fecha', value: viewRecord.fecha },
                  { label: 'Nombre', value: `${viewRecord.nombre} ${viewRecord.apellido}` },
                  { label: 'Correo', value: viewRecord.correo },
                  { label: 'Telefono', value: viewRecord.telefono },
                  { label: 'Origen', value: viewRecord.origen || '-' },
                  { label: 'Estado', value: viewRecord.estado },
                  { label: 'Propiedad', value: prop ? `${prop.codigo} - ${prop.urbanizacion}` : '-' },
                  { label: 'Comercial Asignado', value: com ? `${com.nombre} ${com.apellido}` : 'Sin asignar' },
                ].map(f => (
                  <div key={f.label} style={{ border: '2px solid #000000', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <p className="text-xs text-gray-600">{f.label}</p>
                    <p className="text-sm text-black">{f.value || '-'}</p>
                  </div>
                ))}
              </div>
              {viewRecord.mensaje && <div style={{ border: '2px solid #000000', borderRadius: '0.5rem', padding: '0.75rem', marginTop: '0.75rem' }}><p className="text-xs text-gray-600">Mensaje del Prospecto</p><p className="text-sm text-black">{viewRecord.mensaje}</p></div>}
              {viewRecord.notas && <div style={{ border: '2px solid #000000', borderRadius: '0.5rem', padding: '0.75rem', marginTop: '0.75rem' }}><p className="text-xs text-gray-600">Notas del Comercial</p><p className="text-sm text-black">{viewRecord.notas}</p></div>}
              {/* Property preview */}
              {prop && prop.imagenes && prop.imagenes.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-white/40 mb-2">Propiedad de Interes</p>
                  <div className="flex gap-2">
                    {prop.imagenes.slice(0, 3).map((img, i) => (
                      <div key={i} className="w-24 h-24 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-white mt-1">{prop.urbanizacion} - {prop.tipo_propiedad} - {prop.ciudad}</p>
                </div>
              )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-6xl h-screen flex flex-col rounded-2xl" style={{ background: '#ffffff', border: '2px solid #000000' }}>
            <ModalHeader onClose={() => setIsFormOpen(false)} />
            <div className="text-center py-4" style={{ background: '#001e4d', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <p className="text-lg font-bold" style={{ color: '#ffffff' }}>{user?.usuario}</p>
              <p className="text-sm" style={{ color: '#ffffff' }}>{user?.rol}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-black">{form.id ? 'Editar Solicitud' : 'Nueva Solicitud'}</h2>
            </div>
            {formError && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#ffebee', border: '1px solid #ef5350', color: '#c62828' }}>{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Codigo</label>
                  <input value={form.id ? form.codigo : nextCode()} readOnly className="w-full rounded-lg px-3 py-2 text-sm outline-none cursor-not-allowed opacity-70" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Nombre *</label>
                  <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Apellido</label>
                  <input value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Correo</label>
                  <input type="email" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Telefono</label>
                  <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Origen de la Solicitud</label>
                  <select value={form.origen} onChange={e => setForm(f => ({ ...f, origen: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {config.origenesSolicitud.map(o => <option key={o.id} value={o.nombre}>{o.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Propiedad de Interes *</label>
                  <select value={form.propiedad_id} onChange={e => setForm(f => ({ ...f, propiedad_id: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {propiedades.filter(p => p.estado === 'Disponible').map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.urbanizacion}</option>)}
                  </select>
                </div>
              </div>
              {/* Property details preview */}
              {propSeleccionada && (
                <div className="rounded-xl p-4" style={{ background: '#f3f4f6', border: '1px solid #d1d5db' }}>
                  <p className="text-xs font-semibold mb-2 text-gray-700">Datos de la Propiedad Seleccionada</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Tipo</p>
                      <p className="text-sm text-black">{propSeleccionada.tipo_propiedad || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Valor</p>
                      <p className="text-sm text-black">{monedaSimbolo(propSeleccionada.tipo_moneda)} {propSeleccionada.precio_venta > 0 ? fmtNum(propSeleccionada.precio_venta, 2) : fmtNum(propSeleccionada.precio_alquiler, 2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Modalidad</p>
                      <p className="text-sm text-black">{propSeleccionada.modalidad || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Direccion</p>
                      <p className="text-sm text-black">{propSeleccionada.direccion || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Ciudad/Poblacion</p>
                      <p className="text-sm text-black">{propSeleccionada.ciudad || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Zona</p>
                      <p className="text-sm text-black">{propSeleccionada.zona || '-'}</p>
                    </div>
                  </div>
                  {propSeleccionada.imagenes && propSeleccionada.imagenes.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {propSeleccionada.imagenes.slice(0, 3).map((img, i) => (
                        <div key={i} className="w-20 h-20 rounded-lg overflow-hidden" style={{ border: '1px solid #d1d5db' }}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Estado</label>
                  <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Nueva">Nueva</option>
                    <option value="En Atencion">En Atencion</option>
                    <option value="Atendida">Atendida</option>
                    <option value="Descartada">Descartada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Comercial Asignado</label>
                  <select value={form.comercial_asignado} onChange={e => setForm(f => ({ ...f, comercial_asignado: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Sin asignar</option>
                    {comerciales.filter(c => c.situacion === 'Activo').map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Mensaje del Prospecto</label>
                <textarea value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Notas del Comercial</label>
                <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={2} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>Guardar</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
