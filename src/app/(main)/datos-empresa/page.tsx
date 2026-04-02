'use client'

import { useState, useRef } from 'react'
import { useEmpresaStore, type DatosEmpresa } from '@/features/datos-empresa/store/empresa-store'
import { useConfigStore } from '@/features/configuracion/store/configuracion-store'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import { compressImage } from '@/shared/lib/compress-image'

const inputSt: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }
const selectSt: React.CSSProperties = { background: 'rgba(41,15,5,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }

const initForm = (): DatosEmpresa => ({
  id: '', nombre: '', tipo_identificacion: '', nro_documento: '', correo: '',
  telefono: '', direccion: '', ciudad: '', pais: '', representante_legal: '', logo: '', imagen: '',
})

export default function DatosEmpresaPage() {
  const { empresa, setEmpresa } = useEmpresaStore()
  const config = useConfigStore()
  const [form, setForm] = useState<DatosEmpresa>(empresa ? { ...empresa } : initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setFormError('Solo se permiten imagenes.'); return }
    if (file.size > 10 * 1024 * 1024) { setFormError('La imagen no puede superar 10 MB.'); return }
    try {
      const compressed = await compressImage(file)
      setForm(f => ({ ...f, logo: compressed }))
      setFormError('')
    } catch { setFormError('Error al procesar imagen.') }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.nombre.trim()) { setFormError('El nombre es obligatorio.'); return }
    setEmpresa({ ...form, id: form.id || crypto.randomUUID() })
    setSaved(true)
    setIsFormOpen(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleEdit = () => {
    setForm(empresa ? { ...empresa } : initForm())
    setIsFormOpen(true)
  }

  const headers = ['Campo', 'Valor']
  const rows = empresa ? [
    ['Nombre', empresa.nombre],
    ['Tipo Identificacion', empresa.tipo_identificacion],
    ['Nro. Documento', empresa.nro_documento],
    ['Correo', empresa.correo],
    ['Telefono', empresa.telefono],
    ['Direccion', empresa.direccion],
    ['Ciudad/Poblacion', empresa.ciudad],
    ['Pais', empresa.pais],
    ['Representante Legal', empresa.representante_legal],
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Datos de la Empresa</h1>
        <div className="flex items-center gap-2">
          {empresa && (
            <>
              <button onClick={() => exportToPDF('Datos de la Empresa', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}>PDF</button>
              <button onClick={() => exportToExcel([{ Nombre: empresa.nombre, 'Tipo Identificacion': empresa.tipo_identificacion, 'Nro Documento': empresa.nro_documento, Correo: empresa.correo, Telefono: empresa.telefono, Direccion: empresa.direccion, Ciudad: empresa.ciudad, Pais: empresa.pais, 'Representante Legal': empresa.representante_legal }], 'Datos_Empresa')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(22,163,74,0.85)', border: '1px solid rgba(22,163,74,1)', color: '#fff' }}>Excel</button>
              <button onClick={() => printTable('Datos de la Empresa', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(202,138,4,0.9)', border: '1px solid rgba(202,138,4,1)', color: '#fff' }}>Imprimir</button>
            </>
          )}
          <button onClick={handleEdit} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>
            {empresa ? 'Editar Datos' : '+ Registrar Empresa'}
          </button>
        </div>
      </div>

      {saved && <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>Datos guardados exitosamente.</div>}

      {/* View Mode */}
      {empresa ? (
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-6 mb-6">
            {empresa.logo ? (
              <img src={empresa.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover" style={{ border: '2px solid rgba(30,64,175,0.3)' }} />
            ) : (
              <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: 'rgba(30,64,175,0.1)', border: '2px dashed rgba(30,64,175,0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{empresa.nombre}</h2>
              {empresa.tipo_identificacion && <p className="text-sm text-white/50">{empresa.tipo_identificacion}: {empresa.nro_documento}</p>}
            </div>
            {empresa.imagen && (
              <img src={empresa.imagen} alt="Foto" className="ml-auto h-20 rounded-xl object-contain" style={{ border: '1px solid rgba(255,255,255,0.15)' }} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Correo', value: empresa.correo },
              { label: 'Telefono', value: empresa.telefono },
              { label: 'Direccion', value: empresa.direccion },
              { label: 'Ciudad/Poblacion', value: empresa.ciudad },
              { label: 'Pais', value: empresa.pais },
              { label: 'Representante Legal', value: empresa.representante_legal },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs text-white/40">{f.label}</p>
                <p className="text-sm text-white">{f.value || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-white/30 text-lg mb-4">No hay datos de empresa registrados</p>
          <button onClick={handleEdit} className="px-6 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>
            Registrar Empresa
          </button>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{empresa ? 'Editar Datos de la Empresa' : 'Registrar Empresa'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>
            {formError && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center gap-6 mb-2">
                {form.logo ? (
                  <div className="relative">
                    <img src={form.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover" style={{ border: '2px solid rgba(30,64,175,0.3)' }} />
                    <button type="button" onClick={() => setForm(f => ({ ...f, logo: '' }))} className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style={{ background: 'rgba(239,68,68,0.8)' }}>✕</button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: 'rgba(30,64,175,0.1)', border: '2px dashed rgba(30,64,175,0.3)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Logo de la Empresa</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm text-white/60" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Nombre de la Empresa *</label>
                  <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Tipo Identificacion</label>
                  <select value={form.tipo_identificacion} onChange={e => setForm(f => ({ ...f, tipo_identificacion: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {config.tiposIdentificacion.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Nro. Documento</label>
                  <input value={form.nro_documento} onChange={e => setForm(f => ({ ...f, nro_documento: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
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
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Direccion</label>
                  <input value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Ciudad/Poblacion</label>
                  <select value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {config.ciudades.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Pais</label>
                  <select value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {config.paises.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Representante Legal</label>
                  <input value={form.representante_legal} onChange={e => setForm(f => ({ ...f, representante_legal: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
              </div>

              {/* Foto / Imagen */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Foto / Imagen</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: 'rgba(30,64,175,0.4)', border: '1px solid rgba(30,64,175,0.5)' }}>
                    Cargar Imagen
                    <input type="file" accept="image/*" className="hidden" onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 10 * 1024 * 1024) { setFormError('La imagen no debe superar 10 MB.'); return }
                      try {
                        const compressed = await compressImage(file)
                        setForm(f => ({ ...f, imagen: compressed }))
                      } catch { setFormError('Error al procesar imagen.') }
                    }} />
                  </label>
                  {form.imagen && (
                    <div className="relative">
                      <img src={form.imagen} alt="Foto" className="h-16 w-16 object-cover rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.2)' }} />
                      <button type="button" onClick={() => setForm(f => ({ ...f, imagen: '' }))} className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white" style={{ background: 'rgba(239,68,68,0.8)' }}>✕</button>
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
