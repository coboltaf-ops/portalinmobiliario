'use client'

import { useState } from 'react'
import { useCotizacionesStore, type Cotizacion } from '@/features/cotizaciones/store/cotizaciones-store'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { usePropiedadesStore } from '@/features/propiedades/store/propiedades-store'
import { useComercialesStore } from '@/features/comerciales/store/comerciales-store'
import { useConfigStore } from '@/features/configuracion/store/configuracion-store'
import { useCorreosStore } from '@/features/correos-enviados/store/correos-store'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'
import { formatDate, toInputDate, todayFormatted, fmtNum } from '@/shared/lib/format-date'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import VoiceSearchButton from '@/shared/components/voice-search-button'
import { compressImage } from '@/shared/lib/compress-image'
import jsPDF from 'jspdf'
import { PDFPreview } from '@/shared/components/pdf-preview'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }
const selectSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

const initForm = (): Cotizacion => ({
  id: '', nro_cotizacion: '', fecha: todayFormatted(), cliente_id: '', propiedad_id: '',
  comercial_id: '', tipo_moneda: 'USD', precio_ofertado: 0, condiciones_pago: '',
  observaciones: '', situacion: 'Pendiente', imagen: '',
})

export default function CotizacionesPage() {
  const { cotizaciones, addCotizacion, updateCotizacion, deleteCotizacion } = useCotizacionesStore()
  const clientes = useClientesStore(s => s.clientes)
  const propiedades = usePropiedadesStore(s => s.propiedades)
  const comerciales = useComercialesStore(s => s.comerciales)
  const config = useConfigStore()
  const addCorreo = useCorreosStore(s => s.addCorreo)
  const empresa = useEmpresaStore(s => s.empresa)

  const [form, setForm] = useState<Cotizacion>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState<Cotizacion | null>(null)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const [sending, setSending] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfFileName, setPdfFileName] = useState('')

  const nextCode = () => {
    const nums = cotizaciones.map(c => parseInt(c.nro_cotizacion.replace('COT-', '')) || 0)
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `COT-${String(max + 1).padStart(5, '0')}`
  }

  const monedaSimbolo = (code: string) => {
    const m = config.monedas.find(m => m.nombre === code)
    return m ? m.simbolo : '$'
  }

  const handlePropiedadChange = (propId: string) => {
    const prop = propiedades.find(p => p.id === propId)
    if (prop) {
      setForm(f => ({
        ...f,
        propiedad_id: propId,
        tipo_moneda: prop.tipo_moneda,
        precio_ofertado: prop.precio_venta > 0 ? prop.precio_venta : prop.precio_alquiler,
      }))
    } else {
      setForm(f => ({ ...f, propiedad_id: propId }))
    }
  }

  const filtered = cotizaciones.filter(c => {
    const cliente = clientes.find(cl => cl.id === c.cliente_id)
    const prop = propiedades.find(p => p.id === c.propiedad_id)
    return c.nro_cotizacion.toLowerCase().includes(search.toLowerCase()) ||
      (cliente && `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(search.toLowerCase())) ||
      (prop && prop.urbanizacion.toLowerCase().includes(search.toLowerCase())) ||
      c.situacion.toLowerCase().includes(search.toLowerCase())
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.cliente_id) { setFormError('Seleccione un cliente.'); return }
    if (!form.propiedad_id) { setFormError('Seleccione una propiedad.'); return }
    if (form.id) { updateCotizacion(form.id, form) }
    else { addCotizacion({ ...form, id: crypto.randomUUID(), nro_cotizacion: nextCode() }) }
    setIsFormOpen(false)
    setForm(initForm())
  }

  const handleEdit = (c: Cotizacion) => { setForm({ ...c }); setIsFormOpen(true) }
  const handleDelete = (id: string) => { if (confirm('¿Eliminar esta cotizacion?')) deleteCotizacion(id) }

  const generatePDF = (cot: Cotizacion) => {
    try {
      const cliente = clientes.find(c => c.id === cot.cliente_id)
      const prop = propiedades.find(p => p.id === cot.propiedad_id)
      const com = comerciales.find(c => c.id === cot.comercial_id)

      const doc = new jsPDF('p', 'mm', 'a4')
      const pageW = 210
      const margin = 15
      const contentW = pageW - margin * 2
      let y = margin

      doc.setFillColor(30, 64, 175)
      doc.rect(0, 0, pageW, 30, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(empresa?.nombre || 'Portal Inmobiliario', margin, 12)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      if (empresa?.direccion) doc.text(empresa.direccion, margin, 17)
      if (empresa?.ciudad) doc.text(empresa.ciudad, margin, 21)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('COTIZACION', pageW - margin, 12, { align: 'right' })
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(cot.nro_cotizacion, pageW - margin, 17, { align: 'right' })
      doc.text(cot.fecha, pageW - margin, 21, { align: 'right' })

      y = 40

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Datos del Cliente', margin, y)
      y += 8

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Nombre: ${cliente ? `${cliente.nombre} ${cliente.apellido}` : '-'}`, margin, y)
      y += 6
      doc.text(`Correo: ${cliente?.correo || '-'}`, margin, y)
      y += 6
      doc.text(`Telefono: ${cliente?.telefono || '-'}`, margin, y)
      y += 12

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Propiedad', margin, y)
      y += 8

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Proyecto: ${prop?.urbanizacion || '-'}`, margin, y)
      y += 6
      doc.text(`Tipo: ${prop?.tipo_propiedad || '-'} | Modalidad: ${prop?.modalidad || '-'}`, margin, y)
      y += 6
      doc.text(`Area: ${fmtNum(prop?.area_m2 || 0)} m² | Habitaciones: ${fmtNum(prop?.habitaciones || 0)} | Banos: ${fmtNum(prop?.banos || 0)}`, margin, y)
      y += 6
      doc.text(`Direccion: ${prop?.direccion || '-'}, ${prop?.ciudad || ''}, ${prop?.zona || ''}`, margin, y)
      y += 6
      if (prop?.amenidades) {
        const lines = doc.splitTextToSize(`Amenidades: ${prop.amenidades}`, contentW)
        doc.text(lines, margin, y)
        y += lines.length * 4 + 6
      }
      y += 6

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Precio y Condiciones', margin, y)
      y += 8

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(`${monedaSimbolo(cot.tipo_moneda)} ${fmtNum(cot.precio_ofertado, 2)}`, margin, y)
      y += 10

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      if (cot.condiciones_pago) {
        const lines = doc.splitTextToSize(`Condiciones de Pago: ${cot.condiciones_pago}`, contentW)
        doc.text(lines, margin, y)
        y += lines.length * 4 + 6
      }
      if (cot.observaciones) {
        const lines = doc.splitTextToSize(`Observaciones: ${cot.observaciones}`, contentW)
        doc.text(lines, margin, y)
        y += lines.length * 4 + 6
      }
      if (com) {
        doc.text(`Asesor: ${com.nombre} ${com.apellido} | ${com.correo} | ${com.movil}`, margin, y)
      }

      const blob = doc.output('blob') as Blob
      const fileName = `Cotizacion_${cot.nro_cotizacion}.pdf`
      setPdfBlob(blob)
      setPdfFileName(fileName)
      setShowPreview(true)
    } catch (err) {
      alert('Error al generar el PDF: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleSendEmail = async (cot: Cotizacion) => {
    const cliente = clientes.find(c => c.id === cot.cliente_id)
    if (!cliente?.correo) { alert('El cliente no tiene correo registrado.'); return }
    setSending(cot.id)
    try {
      const prop = propiedades.find(p => p.id === cot.propiedad_id)
      const res = await fetch('/api/send-cotizacion-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cliente.correo,
          subject: `Cotizacion ${cot.nro_cotizacion} - ${prop?.urbanizacion || 'Propiedad'}`,
          nroCotizacion: cot.nro_cotizacion,
          clienteNombre: `${cliente.nombre} ${cliente.apellido}`,
          propiedadNombre: prop?.urbanizacion || '',
          precio: `${monedaSimbolo(cot.tipo_moneda)} ${fmtNum(cot.precio_ofertado, 2)}`,
          condiciones: cot.condiciones_pago,
          empresaNombre: empresa?.nombre || 'Portal Inmobiliario',
        }),
      })
      if (res.ok) {
        const now = new Date()
        addCorreo({
          id: crypto.randomUUID(),
          fecha: `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`,
          hora: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
          destinatario: cliente.correo,
          asunto: `Cotizacion ${cot.nro_cotizacion} - ${prop?.urbanizacion || 'Propiedad'}`,
          mensaje: `Cotizacion enviada por ${monedaSimbolo(cot.tipo_moneda)} ${fmtNum(cot.precio_ofertado, 2)}`,
          consecutivo: cot.nro_cotizacion,
          estado: 'Enviado',
        })
        alert('Correo enviado exitosamente.')
      } else {
        alert('Error al enviar correo.')
      }
    } catch {
      alert('Error de conexion al enviar correo.')
    } finally {
      setSending(null)
    }
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, { bg: string; color: string; border: string }> = {
      'Pendiente': { bg: 'rgba(245,158,11,0.2)', color: '#60a5fa', border: '1px solid rgba(245,158,11,0.3)' },
      'Aceptada': { bg: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' },
      'Rechazada': { bg: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
    }
    const c = colors[s] || { bg: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }
    return <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: c.bg, color: c.color, border: c.border }}>{s}</span>
  }

  const headers = ['Nro', 'Fecha', 'Cliente', 'Propiedad', 'Comercial', 'Precio', 'Situacion']
  const rows = filtered.map(c => {
    const cli = clientes.find(cl => cl.id === c.cliente_id)
    const prop = propiedades.find(p => p.id === c.propiedad_id)
    const com = comerciales.find(cm => cm.id === c.comercial_id)
    return [c.nro_cotizacion, c.fecha, cli ? `${cli.nombre} ${cli.apellido}` : '', prop?.urbanizacion || '',
      com ? `${com.nombre} ${com.apellido}` : '', `${monedaSimbolo(c.tipo_moneda)} ${fmtNum(c.precio_ofertado, 2)}`, c.situacion]
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Cotizaciones</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToPDF('Cotizaciones', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}>PDF</button>
          <button onClick={() => exportToExcel(filtered.map(c => { const cli = clientes.find(cl => cl.id === c.cliente_id); const prop = propiedades.find(p => p.id === c.propiedad_id); return { Nro: c.nro_cotizacion, Fecha: c.fecha, Cliente: cli ? `${cli.nombre} ${cli.apellido}` : '', Propiedad: prop?.urbanizacion || '', Precio: c.precio_ofertado, Moneda: c.tipo_moneda, Situacion: c.situacion } }), 'Cotizaciones')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(22,163,74,0.85)', border: '1px solid rgba(22,163,74,1)', color: '#fff' }}>Excel</button>
          <button onClick={() => printTable('Cotizaciones', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(202,138,4,0.9)', border: '1px solid rgba(202,138,4,1)', color: '#fff' }}>Imprimir</button>
          <button onClick={() => { setForm(initForm()); setIsFormOpen(true) }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>+ Nueva Cotizacion</button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cotizaciones..." className="flex-1 rounded-lg px-4 py-2 text-sm outline-none" style={inputSt} />
        <VoiceSearchButton onResult={setSearch} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Nro', 'Fecha', 'Cliente', 'Propiedad', 'Precio', 'Situacion', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const cli = clientes.find(cl => cl.id === c.cliente_id)
                const prop = propiedades.find(p => p.id === c.propiedad_id)
                return (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{c.nro_cotizacion}</td>
                    <td className="px-4 py-3 text-white/70">{c.fecha}</td>
                    <td className="px-4 py-3 text-white">{cli ? `${cli.nombre} ${cli.apellido}` : '-'}</td>
                    <td className="px-4 py-3 text-white/70">{prop?.urbanizacion || '-'}</td>
                    <td className="px-4 py-3 text-white font-semibold">{monedaSimbolo(c.tipo_moneda)} {fmtNum(c.precio_ofertado, 2)}</td>
                    <td className="px-4 py-3">{statusBadge(c.situacion)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewRecord(c)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: 'rgba(4,120,87,0.9)', border: '1px solid rgba(4,120,87,1)', color: '#fff' }}>Ver</button>
                        <button onClick={() => generatePDF(c)} className="p-1.5 rounded-lg hover:bg-white/10" title="PDF"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>
                        <button onClick={() => handleSendEmail(c)} disabled={sending === c.id} className="p-1.5 rounded-lg hover:bg-white/10" title="Enviar por correo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></button>
                        <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-white/10" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-white/10" title="Eliminar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30">No hay cotizaciones registradas</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewRecord && (() => {
        const cli = clientes.find(c => c.id === viewRecord.cliente_id)
        const prop = propiedades.find(p => p.id === viewRecord.propiedad_id)
        const com = comerciales.find(c => c.id === viewRecord.comercial_id)
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Cotizacion {viewRecord.nro_cotizacion}</h2>
                <button onClick={() => setViewRecord(null)} className="text-white/60 hover:text-white text-xl">✕</button>
              </div>
              {viewRecord.imagen && (
                <div className="flex justify-center mb-4">
                  <img src={viewRecord.imagen} alt="Foto" className="max-h-40 rounded-xl object-contain" style={{ border: '1px solid rgba(255,255,255,0.15)' }} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Fecha', value: viewRecord.fecha },
                  { label: 'Situacion', value: viewRecord.situacion },
                  { label: 'Cliente', value: cli ? `${cli.nombre} ${cli.apellido}` : '-' },
                  { label: 'Propiedad', value: prop?.urbanizacion || '-' },
                  { label: 'Comercial', value: com ? `${com.nombre} ${com.apellido}` : '-' },
                  { label: 'Precio Ofertado', value: `${monedaSimbolo(viewRecord.tipo_moneda)} ${fmtNum(viewRecord.precio_ofertado, 2)}` },
                ].map(f => (
                  <div key={f.label}><p className="text-xs text-white/40">{f.label}</p><p className="text-sm text-white">{f.value || '-'}</p></div>
                ))}
              </div>
              {viewRecord.condiciones_pago && <div className="mt-3"><p className="text-xs text-white/40">Condiciones de Pago</p><p className="text-sm text-white">{viewRecord.condiciones_pago}</p></div>}
              {viewRecord.observaciones && <div className="mt-3"><p className="text-xs text-white/40">Observaciones</p><p className="text-sm text-white">{viewRecord.observaciones}</p></div>}
            </div>
          </div>
        )
      })()}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{form.id ? 'Editar Cotizacion' : 'Nueva Cotizacion'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>
            {formError && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Fecha</label>
                  <input type="date" value={toInputDate(form.fecha)} onChange={e => setForm(f => ({ ...f, fecha: formatDate(e.target.value) }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Cliente/Prospecto *</label>
                  <select value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {clientes.filter(c => c.situacion === 'Activo').map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido} ({c.tipo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Propiedad *</label>
                  <select value={form.propiedad_id} onChange={e => handlePropiedadChange(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {propiedades.filter(p => p.estado === 'Disponible').map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.urbanizacion}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Comercial</label>
                  <select value={form.comercial_id} onChange={e => setForm(f => ({ ...f, comercial_id: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {comerciales.filter(c => c.situacion === 'Activo').map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Tipo Moneda</label>
                  <select value={form.tipo_moneda} onChange={e => setForm(f => ({ ...f, tipo_moneda: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    {config.monedas.map(m => <option key={m.id} value={m.nombre}>{m.nombre} ({m.simbolo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Precio Ofertado</label>
                  <input type="number" min="0" step="0.01" value={form.precio_ofertado || ''} onChange={e => setForm(f => ({ ...f, precio_ofertado: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Situacion</label>
                  <select value={form.situacion} onChange={e => setForm(f => ({ ...f, situacion: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aceptada">Aceptada</option>
                    <option value="Rechazada">Rechazada</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Condiciones de Pago</label>
                <textarea value={form.condiciones_pago} onChange={e => setForm(f => ({ ...f, condiciones_pago: e.target.value }))} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} rows={2} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
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

      {pdfBlob && (
        <PDFPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          pdfBlob={pdfBlob}
          fileName={pdfFileName}
        />
      )}
    </div>
  )
}
