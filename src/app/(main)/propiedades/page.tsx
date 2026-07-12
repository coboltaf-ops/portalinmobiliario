'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { usePropiedadesStore, type Propiedad } from '@/features/propiedades/store/propiedades-store'
import { useComercialesStore } from '@/features/comerciales/store/comerciales-store'
import { useConfigStore, getZonasByCiudad } from '@/features/configuracion/store/configuracion-store'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { formatDate, toInputDate, todayFormatted, fmtNum } from '@/shared/lib/format-date'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import VoiceSearchButton from '@/shared/components/voice-search-button'
import { ModalHeader } from '@/shared/components/modal-header'
import jsPDF from 'jspdf'
import { compressImage } from '@/shared/lib/compress-image'
import { PDFPreview } from '@/shared/components/pdf-preview'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }
const selectSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

const initForm = (): Propiedad => ({
  id: '', nro_propiedad: 0, codigo: '', urbanizacion: '', nro_apto_casa: '', tipo_propiedad: '', modalidad: 'Venta',
  precio_venta: 0, precio_alquiler: 0, tipo_moneda: 'USD', area_m2: 0,
  habitaciones: 0, banos: 0, estacionamientos: 0, balcones: 0, cuarto_ropas: false, cuarto_servicio: false,
  piscina: false, juegos_infantiles: false, gimnasio: false, monto_administracion_mes: 0, monto_predial_anual: 0,
  amenidades: '', direccion: '',
  ciudad: '', zona: '', estado: 'Disponible', asesor_asignado: '', descripcion: '', imagenes: [],
})

export default function PropiedadesPage() {
  const { propiedades, addPropiedad, updatePropiedad, deletePropiedad } = usePropiedadesStore()
  const comerciales = useComercialesStore(s => s.comerciales)
  const config = useConfigStore()
  const empresa = useEmpresaStore(s => s.empresa)
  const user = useAuthStore(s => s.user)

  const [form, setForm] = useState<Propiedad>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState<Propiedad | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfFileName, setPdfFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const nextNro = () => {
    const nums = propiedades.map(p => p.nro_propiedad || 0)
    return nums.length > 0 ? Math.max(...nums) + 1 : 1
  }

  const nextCode = () => {
    const nums = propiedades.map(p => parseInt(p.codigo.replace('PROP-', '')) || 0)
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `PROP-${String(max + 1).padStart(5, '0')}`
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const currentCount = form.imagenes.length
    const remaining = 5 - currentCount
    if (remaining <= 0) { setFormError('Maximo 5 imagenes permitidas.'); return }
    const toProcess = Array.from(files).slice(0, remaining)

    for (const file of toProcess) {
      if (!file.type.startsWith('image/')) { setFormError('Solo se permiten imagenes.'); continue }
      if (file.size > 10 * 1024 * 1024) { setFormError('Cada imagen no puede superar 10 MB.'); continue }
      try {
        const compressed = await compressImage(file)
        setForm(f => ({ ...f, imagenes: [...f.imagenes, compressed] }))
        setFormError('')
      } catch { setFormError('Error al procesar imagen.') }
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, imagenes: f.imagenes.filter((_, i) => i !== idx) }))
  }

  const filtered = propiedades.filter(p =>
    p.codigo.toLowerCase().includes(search.toLowerCase()) ||
    p.urbanizacion.toLowerCase().includes(search.toLowerCase()) ||
    p.tipo_propiedad.toLowerCase().includes(search.toLowerCase()) ||
    p.ciudad.toLowerCase().includes(search.toLowerCase()) ||
    p.estado.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.urbanizacion.trim()) { setFormError('El nombre del proyecto es obligatorio.'); return }
    if (!form.tipo_propiedad) { setFormError('El tipo de propiedad es obligatorio.'); return }
    if (form.id) {
      updatePropiedad(form.id, form)
    } else {
      addPropiedad({ ...form, id: crypto.randomUUID(), nro_propiedad: nextNro(), codigo: nextCode() })
    }
    setIsFormOpen(false)
    setForm(initForm())
  }

  const generateFichaPDF = (p: Propiedad) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageW = 210
      const margin = 15
      const contentW = pageW - margin * 2
      let y = margin

      const nombre = p.urbanizacion || (p as Record<string, unknown>).nombre_proyecto as string || 'Sin nombre'
      const safe = (v: unknown) => (v !== undefined && v !== null) ? String(v) : '-'

      const addPage = () => { doc.addPage(); y = margin }
      const checkSpace = (need: number) => { if (y + need > 280) addPage() }

      const addImg = (src: string, x: number, iy: number, w: number, h: number) => {
        try {
          const fmt = src.includes('image/png') ? 'PNG' : 'JPEG'
          doc.addImage(src, fmt, x, iy, w, h)
        } catch { /* skip broken image */ }
      }

      // --- Header with company info ---
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, pageW, 40, 'F')

      if (empresa?.logo) addImg(empresa.logo, margin, 8, 24, 24)

      const headerX = empresa?.logo ? margin + 28 : margin
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(empresa?.nombre || 'Portal Inmobiliario', headerX, 20)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      if (empresa?.telefono) doc.text(`Tel: ${empresa.telefono}`, headerX, 26)
      if (empresa?.correo) doc.text(empresa.correo, headerX, 31)

      doc.setFontSize(9)
      doc.text('FICHA DE PROPIEDAD', pageW - margin, 20, { align: 'right' })
      doc.text(p.codigo || '', pageW - margin, 26, { align: 'right' })
      doc.text(new Date().toLocaleDateString('es-ES'), pageW - margin, 31, { align: 'right' })

      y = 48

      // --- Property title ---
      doc.setTextColor(30, 64, 175)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(nombre, margin, y)
      y += 6
      doc.setDrawColor(30, 64, 175)
      doc.setLineWidth(0.8)
      doc.line(margin, y, margin + contentW, y)
      y += 8

      // --- Main image ---
      const imgs = p.imagenes || []
      if (imgs.length > 0) {
        addImg(imgs[0], margin, y, contentW, 80)
        y += 86
      }

      // --- Info grid ---
      const asesor = comerciales.find(c => c.id === p.asesor_asignado)
      const sym = monedaSimbolo(p.tipo_moneda)
      const fields: [string, string][] = [
        ['Codigo', safe(p.codigo)],
        ['Nro Apto/Casa', safe(p.nro_apto_casa)],
        ['Tipo', safe(p.tipo_propiedad)],
        ['Modalidad', safe(p.modalidad)],
        ['Precio Venta', p.precio_venta > 0 ? `${sym} ${fmtNum(p.precio_venta, 2)}` : '-'],
        ['Precio Alquiler', p.precio_alquiler > 0 ? `${sym} ${fmtNum(p.precio_alquiler, 2)}` : '-'],
        ['Area', `${fmtNum(p.area_m2)} m²`],
        ['Habitaciones', fmtNum(p.habitaciones)],
        ['Banos', fmtNum(p.banos)],
        ['Estacionamientos', fmtNum(p.estacionamientos)],
        ['Balcones', fmtNum(p.balcones ?? 0)],
        ['Cuarto de Ropas', p.cuarto_ropas ? 'Si' : 'No'],
        ['Cuarto de Servicio', p.cuarto_servicio ? 'Si' : 'No'],
        ['Piscina', p.piscina ? 'Si' : 'No'],
        ['Juegos Infantiles', p.juegos_infantiles ? 'Si' : 'No'],
        ['Gimnasio', p.gimnasio ? 'Si' : 'No'],
        ['Monto Admin (Mes)', `${sym} ${fmtNum(p.monto_administracion_mes || 0, 2)}`],
        ['Monto Predial (Anual)', `${sym} ${fmtNum(p.monto_predial_anual || 0, 2)}`],
        ['Direccion', safe(p.direccion)],
        ['Ciudad/Poblacion', safe(p.ciudad)],
        ['Zona', safe(p.zona)],
        ['Estado', safe(p.estado)],
        ['Asesor', asesor ? `${asesor.nombre} ${asesor.apellido}` : 'Sin asignar'],
        ['Moneda', safe(p.tipo_moneda)],
      ]

      const colW = contentW / 2
      const rowH = 12

      checkSpace(Math.ceil(fields.length / 2) * rowH + 10)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 64, 175)
      doc.text('Detalles del Inmueble', margin, y)
      y += 7

      for (let i = 0; i < fields.length; i += 2) {
        checkSpace(rowH)

        // Label row - red bold text, no background
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(200, 0, 0)
        doc.text(fields[i][0], margin + 2, y)

        if (i + 1 < fields.length) {
          doc.text(fields[i + 1][0], margin + colW + 2, y)
        }

        // Value row
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(9)
        doc.text(fields[i][1], margin + 2, y + 6)

        if (i + 1 < fields.length) {
          doc.text(fields[i + 1][1], margin + colW + 2, y + 6)
        }

        y += rowH
      }
      y += 4

      // --- Amenidades ---
      if (p.amenidades) {
        checkSpace(20)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 64, 175)
        doc.text('Amenidades', margin, y)
        y += 6
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(50, 50, 50)
        const lines = doc.splitTextToSize(p.amenidades, contentW)
        doc.text(lines, margin, y)
        y += lines.length * 4.5 + 4
      }

      // --- Descripcion ---
      if (p.descripcion) {
        checkSpace(20)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 64, 175)
        doc.text('Descripcion', margin, y)
        y += 6
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(50, 50, 50)
        const lines = doc.splitTextToSize(p.descripcion, contentW)
        doc.text(lines, margin, y)
        y += lines.length * 4.5 + 4
      }

      // --- Gallery: all photos, 2 per row ---
      if (imgs.length > 0) {
        checkSpace(60)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 64, 175)
        doc.text('Galeria de Fotos', margin, y)
        y += 6

        const thumbW = (contentW - 6) / 2
        const thumbH = 55

        for (let i = 0; i < imgs.length; i++) {
          const col = i % 2
          const x = margin + col * (thumbW + 6)
          if (col === 0) checkSpace(thumbH + 6)
          addImg(imgs[i], x, y, thumbW, thumbH)
          if (col === 1 || i === imgs.length - 1) y += thumbH + 4
        }
      }

      // --- Footer ---
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFillColor(15, 23, 42)
        doc.rect(0, 289, pageW, 8, 'F')
        doc.setFontSize(7)
        doc.setTextColor(180, 180, 180)
        doc.text(empresa?.nombre || 'Portal Inmobiliario', margin, 294)
        doc.text(`Pagina ${i} de ${pageCount}`, pageW - margin, 294, { align: 'right' })
      }

      const blob = doc.output('blob') as Blob
      const fileName = `Ficha_${p.codigo || 'PROP'}_${nombre.replace(/\s+/g, '_')}.pdf`
      setPdfBlob(blob)
      setPdfFileName(fileName)
      setShowPreview(true)
    } catch (err) {
      alert('Error al generar el PDF: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const handleEdit = (p: Propiedad) => { setForm({ ...p }); setIsFormOpen(true) }
  const handleDelete = (id: string) => { if (confirm('¿Eliminar esta propiedad?')) deletePropiedad(id) }

  const statusBadge = (s: string) => {
    const colors: Record<string, { bg: string; color: string; border: string }> = {
      'Disponible': { bg: 'rgba(29,78,216,0.2)', color: '#3b82f6', border: '1px solid rgba(29,78,216,0.3)' },
      'Reservada': { bg: 'rgba(245,158,11,0.2)', color: '#60a5fa', border: '1px solid rgba(245,158,11,0.3)' },
      'Vendida': { bg: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' },
      'Alquilada': { bg: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' },
    }
    const c = colors[s] || { bg: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }
    return <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: c.bg, color: c.color, border: c.border }}>{s}</span>
  }

  const monedaSimbolo = (code: string) => {
    const m = config.monedas.find(m => m.nombre === code)
    return m ? m.simbolo : '$'
  }

  const headers = ['Nro', 'Codigo', 'Urbanizacion', 'Tipo', 'Modalidad', 'Precio Venta', 'Precio Alquiler', 'Moneda', 'Area m2', 'Ciudad/Poblacion', 'Zona', 'Estado', 'Asesor']
  const rows = filtered.map(p => {
    const asesor = comerciales.find(c => c.id === p.asesor_asignado)
    return [String(p.nro_propiedad || '-'), p.codigo, p.urbanizacion, p.tipo_propiedad, p.modalidad,
      `${monedaSimbolo(p.tipo_moneda)} ${fmtNum(p.precio_venta, 2)}`,
      `${monedaSimbolo(p.tipo_moneda)} ${fmtNum(p.precio_alquiler, 2)}`,
      p.tipo_moneda, fmtNum(p.area_m2), p.ciudad, p.zona, p.estado,
      asesor ? `${asesor.nombre} ${asesor.apellido}` : '']
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
        <h1 className="text-2xl font-bold text-white">Propiedades</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToPDF('Propiedades', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}>PDF</button>
          <button onClick={() => exportToExcel(filtered.map(p => ({ Codigo: p.codigo, Proyecto: p.urbanizacion, Tipo: p.tipo_propiedad, Modalidad: p.modalidad, 'Precio Venta': p.precio_venta, 'Precio Alquiler': p.precio_alquiler, Moneda: p.tipo_moneda, 'Area m2': p.area_m2, 'Ciudad/Poblacion': p.ciudad, Zona: p.zona, Estado: p.estado })), 'Propiedades')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(22,163,74,0.85)', border: '1px solid rgba(22,163,74,1)', color: '#fff' }}>Excel</button>
          <button onClick={() => printTable('Propiedades', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(202,138,4,0.9)', border: '1px solid rgba(202,138,4,1)', color: '#fff' }}>Imprimir</button>
          <button onClick={() => window.open('/catalogo', '_blank')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(139,92,246,0.85)', border: '1px solid rgba(139,92,246,1)', color: '#fff' }}>Portal Publico</button>
          <button onClick={() => { setForm(initForm()); setIsFormOpen(true) }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>+ Nueva Propiedad</button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar propiedades..." className="flex-1 rounded-lg px-4 py-2 text-sm outline-none" style={inputSt} />
        <VoiceSearchButton onResult={setSearch} />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Codigo', 'Urbanizacion', 'Tipo', 'Modalidad', 'Precio', 'Area', 'Ciudad/Poblacion', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{p.codigo}</td>
                  <td className="px-4 py-3 text-white">{p.urbanizacion}</td>
                  <td className="px-4 py-3 text-white/70">{p.tipo_propiedad}</td>
                  <td className="px-4 py-3 text-white/70">{p.modalidad}</td>
                  <td className="px-4 py-3 text-white">{monedaSimbolo(p.tipo_moneda)} {p.precio_venta > 0 ? fmtNum(p.precio_venta, 2) : fmtNum(p.precio_alquiler, 2)}</td>
                  <td className="px-4 py-3 text-white/70">{fmtNum(p.area_m2)} m²</td>
                  <td className="px-4 py-3 text-white/70">{p.ciudad}</td>
                  <td className="px-4 py-3">{statusBadge(p.estado)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setViewRecord(p); setGalleryIndex(0) }} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: '#ff9800', color: '#ffffff' }}>Ver</button>
                      <button onClick={() => handleEdit(p)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: '#10b981', color: '#ffffff' }}>Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: '#ef4444', color: '#ffffff' }}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-white/30">No hay propiedades registradas</td></tr>
              )}
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
              <h2 className="text-lg font-bold text-black">{viewRecord.codigo} - {viewRecord.urbanizacion}</h2>
            </div>
            {/* Image Gallery */}
            {viewRecord.imagenes.length > 0 && (
              <div className="mb-4">
                <div className="rounded-xl overflow-hidden mb-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <img src={viewRecord.imagenes[galleryIndex]} alt="Propiedad" className="w-full h-64 object-cover" />
                </div>
                <div className="flex gap-2">
                  {viewRecord.imagenes.map((img, i) => (
                    <button key={i} onClick={() => setGalleryIndex(i)} className="w-16 h-16 rounded-lg overflow-hidden" style={{ border: i === galleryIndex ? '2px solid #3b82f6' : '2px solid transparent' }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Codigo', value: viewRecord.codigo || '-' },
                { label: 'Nro Apto/Casa', value: viewRecord.nro_apto_casa || '-' },
                { label: 'Tipo', value: viewRecord.tipo_propiedad },
                { label: 'Modalidad', value: viewRecord.modalidad },
                { label: 'Precio Venta', value: `${monedaSimbolo(viewRecord.tipo_moneda)} ${fmtNum(viewRecord.precio_venta, 2)}` },
                { label: 'Precio Alquiler', value: `${monedaSimbolo(viewRecord.tipo_moneda)} ${fmtNum(viewRecord.precio_alquiler, 2)}` },
                { label: 'Area', value: `${fmtNum(viewRecord.area_m2)} m²` },
                { label: 'Habitaciones', value: fmtNum(viewRecord.habitaciones) },
                { label: 'Banos', value: fmtNum(viewRecord.banos) },
                { label: 'Estacionamientos', value: fmtNum(viewRecord.estacionamientos) },
                { label: 'Balcones', value: fmtNum(viewRecord.balcones || 0) },
                { label: 'Cuarto de Ropas', value: viewRecord.cuarto_ropas ? 'Si' : 'No' },
                { label: 'Cuarto de Servicio', value: viewRecord.cuarto_servicio ? 'Si' : 'No' },
                { label: 'Piscina', value: viewRecord.piscina ? 'Si' : 'No' },
                { label: 'Juegos Infantiles', value: viewRecord.juegos_infantiles ? 'Si' : 'No' },
                { label: 'Gimnasio', value: viewRecord.gimnasio ? 'Si' : 'No' },
                { label: 'Monto Administracion (Mes)', value: `${monedaSimbolo(viewRecord.tipo_moneda)} ${fmtNum(viewRecord.monto_administracion_mes || 0, 2)}` },
                { label: 'Monto Predial (Anual)', value: `${monedaSimbolo(viewRecord.tipo_moneda)} ${fmtNum(viewRecord.monto_predial_anual || 0, 2)}` },
                { label: 'Direccion', value: viewRecord.direccion },
                { label: 'Ciudad/Poblacion', value: viewRecord.ciudad },
                { label: 'Zona', value: viewRecord.zona },
                { label: 'Estado', value: viewRecord.estado },
                { label: 'Asesor', value: (() => { const a = comerciales.find(c => c.id === viewRecord.asesor_asignado); return a ? `${a.nombre} ${a.apellido}` : 'Sin asignar' })() },
              ].map(f => (
                <div key={f.label} style={{ border: '2px solid #000000', borderRadius: '0.5rem', padding: '0.75rem' }}>
                  <p className="text-xs text-gray-600">{f.label}</p>
                  <p className="text-sm text-black">{f.value || '-'}</p>
                </div>
              ))}
            </div>
            {viewRecord.amenidades && <div style={{ border: '2px solid #000000', borderRadius: '0.5rem', padding: '0.75rem', marginTop: '0.75rem' }}><p className="text-xs text-gray-600">Amenidades</p><p className="text-sm text-black">{viewRecord.amenidades}</p></div>}
            {viewRecord.descripcion && <div style={{ border: '2px solid #000000', borderRadius: '0.5rem', padding: '0.75rem', marginTop: '0.75rem' }}><p className="text-xs text-gray-600">Descripcion</p><p className="text-sm text-black">{viewRecord.descripcion}</p></div>}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
              <button onClick={() => generateFichaPDF(viewRecord)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90" style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Ficha PDF
              </button>
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
              <h2 className="text-lg font-bold text-black">{form.id ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
            </div>
            {formError && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#ffebee', border: '1px solid #ef5350', color: '#c62828' }}>{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Codigo</label>
                  <input value={form.id ? form.codigo : nextCode()} readOnly className="w-full rounded-lg px-3 py-2 text-sm outline-none cursor-not-allowed opacity-70" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Urbanizacion *</label>
                  <input value={form.urbanizacion} onChange={e => setForm(f => ({ ...f, urbanizacion: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Nro Apto/Casa</label>
                  <input value={form.nro_apto_casa} onChange={e => setForm(f => ({ ...f, nro_apto_casa: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Tipo Propiedad *</label>
                  <select value={form.tipo_propiedad} onChange={e => setForm(f => ({ ...f, tipo_propiedad: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {config.tiposPropiedad.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Modalidad</label>
                  <select value={form.modalidad} onChange={e => setForm(f => ({ ...f, modalidad: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Venta">Venta</option>
                    <option value="Alquiler">Alquiler</option>
                    <option value="Venta y Alquiler">Venta y Alquiler</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Tipo Moneda</label>
                  <select value={form.tipo_moneda} onChange={e => setForm(f => ({ ...f, tipo_moneda: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    {config.monedas.map(m => <option key={m.id} value={m.nombre}>{m.nombre} ({m.simbolo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Precio Venta</label>
                  <input type="number" min="0" step="0.01" value={form.precio_venta || ''} onChange={e => setForm(f => ({ ...f, precio_venta: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Precio Alquiler</label>
                  <input type="number" min="0" step="0.01" value={form.precio_alquiler || ''} onChange={e => setForm(f => ({ ...f, precio_alquiler: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Area m²</label>
                  <input type="number" min="0" value={form.area_m2 || ''} onChange={e => setForm(f => ({ ...f, area_m2: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Habitaciones</label>
                  <input type="number" min="0" value={form.habitaciones || ''} onChange={e => setForm(f => ({ ...f, habitaciones: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Banos</label>
                  <input type="number" min="0" value={form.banos || ''} onChange={e => setForm(f => ({ ...f, banos: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Estacionamientos</label>
                  <input type="number" min="0" value={form.estacionamientos || ''} onChange={e => setForm(f => ({ ...f, estacionamientos: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Balcones</label>
                  <input type="number" min="0" value={form.balcones || ''} onChange={e => setForm(f => ({ ...f, balcones: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Cuarto de Ropas</label>
                  <select value={form.cuarto_ropas ? 'Si' : 'No'} onChange={e => setForm(f => ({ ...f, cuarto_ropas: e.target.value === 'Si' }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Cuarto de Servicio</label>
                  <select value={form.cuarto_servicio ? 'Si' : 'No'} onChange={e => setForm(f => ({ ...f, cuarto_servicio: e.target.value === 'Si' }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Piscina</label>
                  <select value={form.piscina ? 'Si' : 'No'} onChange={e => setForm(f => ({ ...f, piscina: e.target.value === 'Si' }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Juegos Infantiles</label>
                  <select value={form.juegos_infantiles ? 'Si' : 'No'} onChange={e => setForm(f => ({ ...f, juegos_infantiles: e.target.value === 'Si' }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Gimnasio</label>
                  <select value={form.gimnasio ? 'Si' : 'No'} onChange={e => setForm(f => ({ ...f, gimnasio: e.target.value === 'Si' }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Monto Administracion (Mes)</label>
                  <input type="number" min="0" step="0.01" value={form.monto_administracion_mes || ''} onChange={e => setForm(f => ({ ...f, monto_administracion_mes: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Monto Predial (Anual)</label>
                  <input type="number" min="0" step="0.01" value={form.monto_predial_anual || ''} onChange={e => setForm(f => ({ ...f, monto_predial_anual: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Direccion</label>
                  <input value={form.direccion} onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Ciudad/Poblacion</label>
                  <select value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value, zona: '' }))}className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {config.ciudades.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Zona</label>
                  <select value={form.zona} onChange={e => setForm(f => ({ ...f, zona: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {getZonasByCiudad(config.ciudades, form.ciudad).map(z => <option key={z.id} value={z.nombre}>{z.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Estado</label>
                  <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    {config.situacionesPropiedad.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Asesor Asignado</label>
                  <select value={form.asesor_asignado} onChange={e => setForm(f => ({ ...f, asesor_asignado: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {comerciales.filter(c => c.situacion === 'Activo').map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Amenidades</label>
                <textarea value={form.amenidades} onChange={e => setForm(f => ({ ...f, amenidades: e.target.value }))} rows={2} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Descripcion</label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={2} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Imagenes (max 5)</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {form.imagenes.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-xs bg-red-500/80 text-white rounded-bl-lg">✕</button>
                    </div>
                  ))}
                </div>
                {form.imagenes.length < 5 && (
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="text-sm text-gray-700" />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>Guardar</button>
              </div>
            </form>
            </div>
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
    </>
  )
}
