'use client'

import { useState } from 'react'
import { useClientesStore, type Cliente } from '@/features/clientes/store/clientes-store'
import { useComercialesStore } from '@/features/comerciales/store/comerciales-store'
import { useConfigStore, getAllZonas } from '@/features/configuracion/store/configuracion-store'
import { fmtNum } from '@/shared/lib/format-date'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import { compressImage } from '@/shared/lib/compress-image'
import VoiceSearchButton from '@/shared/components/voice-search-button'

const inputSt: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }
const selectSt: React.CSSProperties = { background: 'rgba(41,15,5,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }

const initForm = (): Cliente => ({
  id: '', codigo: '', nombre: '', apellido: '', correo: '', telefono: '', movil: '',
  tipo: 'Prospecto', interes: 'Compra', presupuesto_min: 0, presupuesto_max: 0,
  tipo_moneda: 'USD', zona_preferida: '', tipo_propiedad_buscada: '', asesor_asignado: '',
  observaciones: '', situacion: 'Activo', imagen: '',
})

export default function ClientesPage() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useClientesStore()
  const comerciales = useComercialesStore(s => s.comerciales)
  const config = useConfigStore()
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

  const headers = ['Codigo', 'Nombre', 'Apellido', 'Tipo', 'Interes', 'Presupuesto', 'Zona', 'Asesor', 'Situacion']
  const rows = filtered.map(c => {
    const asesor = comerciales.find(a => a.id === c.asesor_asignado)
    return [c.codigo, c.nombre, c.apellido, c.tipo, c.interes,
      `${monedaSimbolo(c.tipo_moneda)} ${fmtNum(c.presupuesto_min, 2)} - ${fmtNum(c.presupuesto_max, 2)}`,
      c.zona_preferida, asesor ? `${asesor.nombre} ${asesor.apellido}` : '', c.situacion]
  })

  return (
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
                        <button onClick={() => setViewRecord(c)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: 'rgba(4,120,87,0.9)', border: '1px solid rgba(4,120,87,1)', color: '#fff' }}>Ver</button>
                        <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-white/10" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-white/10" title="Eliminar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
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
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{viewRecord.codigo} - {viewRecord.nombre} {viewRecord.apellido}</h2>
              <button onClick={() => setViewRecord(null)} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>
            {viewRecord.imagen && (
              <div className="flex justify-center mb-4">
                <img src={viewRecord.imagen} alt="Foto" className="max-h-40 rounded-xl object-contain" style={{ border: '1px solid rgba(255,255,255,0.15)' }} />
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
                { label: 'Zona Preferida', value: viewRecord.zona_preferida },
                { label: 'Tipo Propiedad Buscada', value: viewRecord.tipo_propiedad_buscada },
                { label: 'Asesor', value: (() => { const a = comerciales.find(x => x.id === viewRecord.asesor_asignado); return a ? `${a.nombre} ${a.apellido}` : '-' })() },
                { label: 'Situacion', value: viewRecord.situacion },
              ].map(f => (
                <div key={f.label}><p className="text-xs text-white/40">{f.label}</p><p className="text-sm text-white">{f.value || '-'}</p></div>
              ))}
            </div>
            {viewRecord.observaciones && <div className="mt-3"><p className="text-xs text-white/40">Observaciones</p><p className="text-sm text-white">{viewRecord.observaciones}</p></div>}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{form.id ? 'Editar' : 'Nuevo'} Cliente/Prospecto</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>
            {formError && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Nombre *</label>
                  <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Apellido *</label>
                  <input value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Correo</label>
                  <input type="email" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Telefono</label>
                  <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Movil</label>
                  <input value={form.movil} onChange={e => setForm(f => ({ ...f, movil: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Tipo</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Prospecto">Prospecto</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Interes</label>
                  <select value={form.interes} onChange={e => setForm(f => ({ ...f, interes: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Compra">Compra</option>
                    <option value="Alquiler">Alquiler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Tipo Moneda</label>
                  <select value={form.tipo_moneda} onChange={e => setForm(f => ({ ...f, tipo_moneda: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    {config.monedas.map(m => <option key={m.id} value={m.nombre}>{m.nombre} ({m.simbolo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Presupuesto Minimo</label>
                  <input type="number" min="0" value={form.presupuesto_min || ''} onChange={e => setForm(f => ({ ...f, presupuesto_min: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Presupuesto Maximo</label>
                  <input type="number" min="0" value={form.presupuesto_max || ''} onChange={e => setForm(f => ({ ...f, presupuesto_max: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Zona Preferida</label>
                  <select value={form.zona_preferida} onChange={e => setForm(f => ({ ...f, zona_preferida: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {getAllZonas(config.ciudades).map(z => <option key={z.id} value={z.nombre}>{z.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Tipo Propiedad Buscada</label>
                  <select value={form.tipo_propiedad_buscada} onChange={e => setForm(f => ({ ...f, tipo_propiedad_buscada: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {config.tiposPropiedad.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Asesor Asignado</label>
                  <select value={form.asesor_asignado} onChange={e => setForm(f => ({ ...f, asesor_asignado: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {comerciales.filter(c => c.situacion === 'Activo').map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Situacion</label>
                  <select value={form.situacion} onChange={e => setForm(f => ({ ...f, situacion: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
              </div>
              {/* Foto / Imagen */}
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Foto / Imagen</label>
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
                  {!form.imagen && <span className="text-white/30 text-xs">Sin imagen (max 2 MB)</span>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
