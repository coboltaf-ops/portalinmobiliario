'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useClientesStore, type Cliente } from '@/features/clientes/store/clientes-store'
import { useComercialesStore } from '@/features/comerciales/store/comerciales-store'
import { useConfigStore, getZonasByCiudad, getAllZonas } from '@/features/configuracion/store/configuracion-store'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { fmtNum } from '@/shared/lib/format-date'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import { compressImage } from '@/shared/lib/compress-image'
import VoiceSearchButton from '@/shared/components/voice-search-button'
import { ModalHeader } from '@/shared/components/modal-header'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }
const selectSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

const initForm = (): Cliente => ({
  id: '', codigo: '', nombre: '', apellido: '', correo: '', telefono: '', movil: '',
  tipo: 'Prospecto', interes: 'Compra', presupuesto_min: 0, presupuesto_max: 0,
  tipo_moneda: 'USD', ciudad_deseada: '', zona_preferida: '', tipo_propiedad_buscada: '', asesor_asignado: '',
  observaciones: '', situacion: 'Activo', imagen: '',
})

export default function ClientesPage() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useClientesStore()
  const comerciales = useComercialesStore(s => s.comerciales)
  const config = useConfigStore()
  const user = useAuthStore(s => s.user)
  const [form, setForm] = useState<Cliente>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState<Cliente | null>(null)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')

  const nextCode = () => {
    const nums = clientes.map(c => parseInt(c.codigo.replace('CLI-', '')) || 0)
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `CLI-${String(max + 1).padStart(5, '0')}`
  }

  const filtered = clientes.filter(c =>
    c.codigo.toLowerCase().includes(search.toLowerCase()) ||
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.apellido.toLowerCase().includes(search.toLowerCase()) ||
    c.correo.toLowerCase().includes(search.toLowerCase()) ||
    c.tipo.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.nombre.trim()) { setFormError('El nombre es obligatorio.'); return }
    if (!form.apellido.trim()) { setFormError('El apellido es obligatorio.'); return }
    if (form.id) { updateCliente(form.id, form) }
    else { addCliente({ ...form, id: crypto.randomUUID(), codigo: nextCode() }) }
    setIsFormOpen(false)
    setForm(initForm())
  }

  const handleEdit = (c: Cliente) => { setForm({ ...c }); setIsFormOpen(true) }
  const handleDelete = (id: string) => { if (confirm('¿Eliminar este registro?')) deleteCliente(id) }

  const statusBadge = (s: string) => {
    const isActive = s === 'Activo'
    return <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{
      background: isActive ? 'rgba(29,78,216,0.2)' : 'rgba(239,68,68,0.2)',
      color: isActive ? '#3b82f6' : '#f87171',
      border: isActive ? '1px solid rgba(29,78,216,0.3)' : '1px solid rgba(239,68,68,0.3)',
    }}>{s}</span>
  }

  const tipoBadge = (t: string) => {
    const isCliente = t === 'Cliente'
    return <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{
      background: isCliente ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
      color: isCliente ? '#34d399' : '#60a5fa',
      border: isCliente ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.3)',
    }}>{t}</span>
  }

  const monedaSimbolo = (code: string) => {
    const m = config.monedas.find(m => m.nombre === code)
    return m ? m.simbolo : '$'
  }

  const headers = ['Codigo', 'Nombre', 'Apellido', 'Tipo', 'Interes', 'Presupuesto', 'Ciudad', 'Zona', 'Asesor', 'Situacion']
  const rows = filtered.map(c => {
    const asesor = comerciales.find(a => a.id === c.asesor_asignado)
    return [c.codigo, c.nombre, c.apellido, c.tipo, c.interes,
      `${monedaSimbolo(c.tipo_moneda)} ${fmtNum(c.presupuesto_min, 2)} - ${fmtNum(c.presupuesto_max, 2)}`,
      c.ciudad_deseada || '-', c.zona_preferida, asesor ? `${asesor.nombre} ${asesor.apellido}` : '', c.situacion]
  })

  return (
    <>
      {/* Header with Logo and Title */}
      <div className="flex items-center justify-between px-8 py-4" style={{ background: '#001e4d' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#2563eb' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{color: '#ffffff', margin: 0}}>PORTAL INMOBILIARIO</h1>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold" style={{ color: '#ffffff', margin: 0 }}>{user?.usuario}</p>
          <p className="text-sm" style={{ color: '#ffffff', margin: 0 }}>{user?.rol}</p>
        </div>
      </div>

      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clientes / Prospectos</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToPDF('Clientes', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}>PDF</button>
          <button onClick={() => exportToExcel(filtered.map(c => ({ Codigo: c.codigo, Nombre: c.nombre, Apellido: c.apellido, Tipo: c.tipo, Interes: c.interes, 'Pres. Min': c.presupuesto_min, 'Pres. Max': c.presupuesto_max, Moneda: c.tipo_moneda, Zona: c.zona_preferida, Situacion: c.situacion })), 'Clientes')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(22,163,74,0.85)', border: '1px solid rgba(22,163,74,1)', color: '#fff' }}>Excel</button>
          <button onClick={() => printTable('Clientes', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(202,138,4,0.9)', border: '1px solid rgba(202,138,4,1)', color: '#fff' }}>Imprimir</button>
          <button onClick={() => { setForm(initForm()); setIsFormOpen(true) }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>+ Nuevo</button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clientes/prospectos..." className="flex-1 rounded-lg px-4 py-2 text-sm outline-none" style={inputSt} />
        <VoiceSearchButton onResult={setSearch} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Codigo', 'Nombre', 'Tipo', 'Interes', 'Presupuesto', 'Zona', 'Asesor', 'Situacion', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const asesor = comerciales.find(a => a.id === c.asesor_asignado)
                return (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{c.codigo}</td>
                    <td className="px-4 py-3 text-white">{c.nombre} {c.apellido}</td>
                    <td className="px-4 py-3">{tipoBadge(c.tipo)}</td>
                    <td className="px-4 py-3 text-white/70">{c.interes}</td>
                    <td className="px-4 py-3 text-white">{monedaSimbolo(c.tipo_moneda)} {fmtNum(c.presupuesto_min, 2)} - {fmtNum(c.presupuesto_max, 2)}</td>
                    <td className="px-4 py-3 text-white/70">{c.zona_preferida}</td>
                    <td className="px-4 py-3 text-white/70">{asesor ? `${asesor.nombre} ${asesor.apellido}` : '-'}</td>
                    <td className="px-4 py-3">{statusBadge(c.situacion)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewRecord(c)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: '#ff9800', color: '#ffffff' }}>Ver</button>
                        <button onClick={() => handleEdit(c)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: '#10b981', color: '#ffffff' }}>Editar</button>
                        <button onClick={() => handleDelete(c.id)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: '#ef4444', color: '#ffffff' }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-white/30">No hay clientes/prospectos registrados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-6xl h-screen flex flex-col rounded-2xl" style={{ background: '#ffffff', border: '2px solid #000000' }}>
            <ModalHeader onClose={() => setViewRecord(null)} userName={user?.usuario} userRole={user?.rol} />
            <div className="text-center py-4" style={{ background: '#001e4d', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <p className="text-lg font-bold" style={{ color: '#ffffff' }}>{user?.usuario}</p>
              <p className="text-sm" style={{ color: '#ffffff' }}>{user?.rol}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-black">{viewRecord.codigo} - {viewRecord.nombre} {viewRecord.apellido}</h2>
            </div>
            {viewRecord.imagen && (
              <div className="flex justify-center mb-4">
                <img src={viewRecord.imagen} alt="Foto" className="max-h-40 rounded-xl object-contain" style={{ border: '1px solid #d1d5db' }} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tipo', value: viewRecord.tipo },
                { label: 'Interes', value: viewRecord.interes },
                { label: 'Correo', value: viewRecord.correo },
                { label: 'Telefono', value: viewRecord.telefono },
                { label: 'Movil', value: viewRecord.movil },
                { label: 'Presupuesto Min', value: `${monedaSimbolo(viewRecord.tipo_moneda)} ${fmtNum(viewRecord.presupuesto_min, 2)}` },
                { label: 'Presupuesto Max', value: `${monedaSimbolo(viewRecord.tipo_moneda)} ${fmtNum(viewRecord.presupuesto_max, 2)}` },
                { label: 'Ciudad Deseada', value: viewRecord.ciudad_deseada },
                { label: 'Zona Preferida', value: viewRecord.zona_preferida },
                { label: 'Tipo Propiedad Buscada', value: viewRecord.tipo_propiedad_buscada },
                { label: 'Asesor', value: (() => { const a = comerciales.find(x => x.id === viewRecord.asesor_asignado); return a ? `${a.nombre} ${a.apellido}` : '-' })() },
                { label: 'Situacion', value: viewRecord.situacion },
              ].map(f => (
                <div key={f.label} style={{ border: '2px solid #000000', borderRadius: '0.5rem', padding: '0.75rem' }}><p className="text-xs text-gray-600">{f.label}</p><p className="text-sm text-black">{f.value || '-'}</p></div>
              ))}
            </div>
            {viewRecord.observaciones && <div style={{ border: '2px solid #000000', borderRadius: '0.5rem', padding: '0.75rem', marginTop: '0.75rem' }}><p className="text-xs text-gray-600">Observaciones</p><p className="text-sm text-black">{viewRecord.observaciones}</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-6xl h-screen flex flex-col rounded-2xl" style={{ background: '#ffffff', border: '2px solid #000000' }}>
            <ModalHeader onClose={() => setIsFormOpen(false)} userName={user?.usuario} userRole={user?.rol} />
            <div className="text-center py-4" style={{ background: '#001e4d', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <p className="text-lg font-bold" style={{ color: '#ffffff' }}>{user?.usuario}</p>
              <p className="text-sm" style={{ color: '#ffffff' }}>{user?.rol}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-black">{form.id ? 'Editar' : 'Nuevo'} Cliente/Prospecto</h2>
            </div>
            {formError && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#ffebee', border: '1px solid #ef5350', color: '#c62828' }}>{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Nombre *</label>
                  <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Apellido *</label>
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
                  <label className="block text-xs font-medium mb-1 text-gray-700">Movil</label>
                  <input value={form.movil} onChange={e => setForm(f => ({ ...f, movil: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Prospecto">Prospecto</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Interes</label>
                  <select value={form.interes} onChange={e => setForm(f => ({ ...f, interes: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Compra">Compra</option>
                    <option value="Alquiler">Alquiler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Tipo Moneda</label>
                  <select value={form.tipo_moneda} onChange={e => setForm(f => ({ ...f, tipo_moneda: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    {config.monedas.map(m => <option key={m.id} value={m.nombre}>{m.nombre} ({m.simbolo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Presupuesto Minimo</label>
                  <input type="number" min="0" value={form.presupuesto_min || ''} onChange={e => setForm(f => ({ ...f, presupuesto_min: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Presupuesto Maximo</label>
                  <input type="number" min="0" value={form.presupuesto_max || ''} onChange={e => setForm(f => ({ ...f, presupuesto_max: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Ciudad Deseada</label>
                  <select value={form.ciudad_deseada} onChange={e => setForm(f => ({ ...f, ciudad_deseada: e.target.value, zona_preferida: '' }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {config.ciudades.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Zona Preferida</label>
                  <select value={form.zona_preferida} onChange={e => setForm(f => ({ ...f, zona_preferida: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {(form.ciudad_deseada ? getZonasByCiudad(config.ciudades, form.ciudad_deseada) : getAllZonas(config.ciudades)).map(z => <option key={z.id} value={z.nombre}>{z.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Tipo Propiedad Buscada</label>
                  <select value={form.tipo_propiedad_buscada} onChange={e => setForm(f => ({ ...f, tipo_propiedad_buscada: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {config.tiposPropiedad.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Asesor Asignado</label>
                  <select value={form.asesor_asignado} onChange={e => setForm(f => ({ ...f, asesor_asignado: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {comerciales.filter(c => c.situacion === 'Activo').map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Situacion</label>
                  <select value={form.situacion} onChange={e => setForm(f => ({ ...f, situacion: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
              </div>
              {/* Foto / Imagen */}
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1 text-gray-700">Foto / Imagen</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'rgba(30,64,175,0.4)', border: '1px solid rgba(30,64,175,0.5)' }}>
                    Cargar Imagen
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 10 * 1024 * 1024) { alert('La imagen no debe superar 10 MB.'); return }
                      try {
                        const compressed = await compressImage(file)
                        setForm(f => ({ ...f, imagen: compressed }))
                      } catch { alert('Error al procesar imagen.') }
                    }} />
                  </label>
                  {form.imagen && (
                    <div className="relative">
                      <img src={form.imagen} alt="Foto" className="h-16 w-16 object-cover rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.2)' }} />
                      <button type="button" onClick={() => setForm(f => ({ ...f, imagen: '' }))}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                        style={{ background: 'rgba(239,68,68,0.8)' }}>&#x2715;</button>
                    </div>
                  )}
                  {!form.imagen && <span className="text-gray-400 text-xs">Sin imagen (max 2 MB)</span>}
                </div>
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
