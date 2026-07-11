'use client'

import { useState, useRef } from 'react'
import { useComercialesStore, type Comercial } from '@/features/comerciales/store/comerciales-store'
import { compressImage } from '@/shared/lib/compress-image'
import { useConfigStore, getAllZonas } from '@/features/configuracion/store/configuracion-store'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import VoiceSearchButton from '@/shared/components/voice-search-button'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }
const selectSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

const initForm = (): Comercial => ({
  id: '', codigo: '', nombre: '', apellido: '', correo: '', telefono: '', movil: '',
  cargo: '', departamento: '', zona_asignada: '', foto: '', situacion: 'Activo',
})

export default function ComercialesPage() {
  const { comerciales, addComercial, updateComercial, deleteComercial } = useComercialesStore()
  const config = useConfigStore()
  const [form, setForm] = useState<Comercial>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState<Comercial | null>(null)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const nextCode = () => {
    const nums = comerciales.map(c => parseInt(c.codigo.replace('COM-', '')) || 0)
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `COM-${String(max + 1).padStart(5, '0')}`
  }

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setFormError('Solo se permiten imagenes.'); return }
    if (file.size > 10 * 1024 * 1024) { setFormError('La imagen no puede superar 10 MB.'); return }
    try {
      const compressed = await compressImage(file)
      setForm(f => ({ ...f, foto: compressed }))
      setFormError('')
    } catch { setFormError('Error al procesar imagen.') }
  }

  const filtered = comerciales.filter(c =>
    c.codigo.toLowerCase().includes(search.toLowerCase()) ||
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.apellido.toLowerCase().includes(search.toLowerCase()) ||
    c.correo.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.nombre.trim()) { setFormError('El nombre es obligatorio.'); return }
    if (!form.apellido.trim()) { setFormError('El apellido es obligatorio.'); return }
    if (!form.correo.trim()) { setFormError('El correo es obligatorio.'); return }
    if (!form.movil.trim()) { setFormError('El movil es obligatorio.'); return }
    if (!form.situacion.trim()) { setFormError('La situacion es obligatoria.'); return }
    if (form.id) { updateComercial(form.id, form) }
    else { addComercial({ ...form, id: crypto.randomUUID(), codigo: nextCode() }) }
    setIsFormOpen(false)
    setForm(initForm())
  }

  const handleEdit = (c: Comercial) => { setForm({ ...c }); setIsFormOpen(true) }
  const handleDelete = (id: string) => { if (confirm('¿Eliminar este comercial?')) deleteComercial(id) }

  const statusBadge = (s: string) => {
    const isActive = s === 'Activo'
    return <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{
      background: isActive ? 'rgba(29,78,216,0.2)' : 'rgba(239,68,68,0.2)',
      color: isActive ? '#3b82f6' : '#f87171',
      border: isActive ? '1px solid rgba(29,78,216,0.3)' : '1px solid rgba(239,68,68,0.3)',
    }}>{s}</span>
  }

  const headers = ['Codigo', 'Nombre', 'Apellido', 'Cargo', 'Departamento', 'Correo', 'Telefono', 'Movil', 'Zona', 'Situacion']
  const rows = filtered.map(c => [c.codigo, c.nombre, c.apellido, c.cargo, c.departamento, c.correo, c.telefono, c.movil, c.zona_asignada, c.situacion])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Comerciales</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToPDF('Comerciales', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}>PDF</button>
          <button onClick={() => exportToExcel(filtered.map(c => ({ Codigo: c.codigo, Nombre: c.nombre, Apellido: c.apellido, Cargo: c.cargo, Departamento: c.departamento, Correo: c.correo, Telefono: c.telefono, Movil: c.movil, Zona: c.zona_asignada, Situacion: c.situacion })), 'Comerciales')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(22,163,74,0.85)', border: '1px solid rgba(22,163,74,1)', color: '#fff' }}>Excel</button>
          <button onClick={() => printTable('Comerciales', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(202,138,4,0.9)', border: '1px solid rgba(202,138,4,1)', color: '#fff' }}>Imprimir</button>
          <button onClick={() => { setForm(initForm()); setIsFormOpen(true) }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>+ Nuevo Comercial</button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar comerciales..." className="flex-1 rounded-lg px-4 py-2 text-sm outline-none" style={inputSt} />
        <VoiceSearchButton onResult={setSearch} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Codigo', 'Foto', 'Nombre', 'Cargo', 'Depto.', 'Correo', 'Telefono', 'Zona', 'Situacion', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{c.codigo}</td>
                  <td className="px-4 py-3">
                    {c.foto ? <img src={c.foto} alt="" className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(30,64,175,0.3)', color: '#3b82f6' }}>{c.nombre.charAt(0)}{c.apellido.charAt(0)}</div>}
                  </td>
                  <td className="px-4 py-3 text-white">{c.nombre} {c.apellido}</td>
                  <td className="px-4 py-3 text-white/70">{c.cargo || '-'}</td>
                  <td className="px-4 py-3 text-white/70">{c.departamento || '-'}</td>
                  <td className="px-4 py-3 text-white/70">{c.correo}</td>
                  <td className="px-4 py-3 text-white/70">{c.telefono}</td>
                  <td className="px-4 py-3 text-white/70">{c.zona_asignada}</td>
                  <td className="px-4 py-3">{statusBadge(c.situacion)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewRecord(c)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: 'rgba(4,120,87,0.9)', border: '1px solid rgba(4,120,87,1)', color: '#fff' }}>Ver</button>
                      <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-white/10" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-white/10" title="Eliminar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-white/30">No hay comerciales registrados</td></tr>}
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
            {viewRecord.foto && <div className="mb-4 flex justify-center"><img src={viewRecord.foto} alt="" className="w-24 h-24 rounded-full object-cover" style={{ border: '2px solid rgba(30,64,175,0.3)' }} /></div>}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nombre', value: viewRecord.nombre },
                { label: 'Apellido', value: viewRecord.apellido },
                { label: 'Cargo', value: viewRecord.cargo },
                { label: 'Departamento', value: viewRecord.departamento },
                { label: 'Correo', value: viewRecord.correo },
                { label: 'Telefono', value: viewRecord.telefono },
                { label: 'Movil', value: viewRecord.movil },
                { label: 'Zona Asignada', value: viewRecord.zona_asignada },
                { label: 'Situacion', value: viewRecord.situacion },
              ].map(f => (
                <div key={f.label}><p className="text-xs text-white/40">{f.label}</p><p className="text-sm text-white">{f.value || '-'}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{form.id ? 'Editar Comercial' : 'Nuevo Comercial'}</h2>
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
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Correo *</label>
                  <input type="email" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Telefono</label>
                  <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Movil *</label>
                  <input value={form.movil} onChange={e => setForm(f => ({ ...f, movil: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Cargo</label>
                  <input value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Departamento</label>
                  <input value={form.departamento} onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Zona Asignada</label>
                  <select value={form.zona_asignada} onChange={e => setForm(f => ({ ...f, zona_asignada: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {getAllZonas(config.ciudades).map(z => <option key={z.id} value={z.nombre}>{z.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Situacion *</label>
                  <select value={form.situacion} onChange={e => setForm(f => ({ ...f, situacion: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Foto</label>
                {form.foto && <img src={form.foto} alt="" className="w-16 h-16 rounded-full object-cover mb-2" />}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFotoUpload} className="text-sm text-white/60" />
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
