'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useContratosStore, type Contrato } from '@/features/contratos/store/contratos-store'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { usePropiedadesStore } from '@/features/propiedades/store/propiedades-store'
import { useComercialesStore } from '@/features/comerciales/store/comerciales-store'
import { useConfigStore } from '@/features/configuracion/store/configuracion-store'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'
import { formatDate, toInputDate, todayFormatted, fmtNum } from '@/shared/lib/format-date'
import { exportToExcel, exportToPDF, printTable } from '@/shared/lib/export-helpers'
import VoiceSearchButton from '@/shared/components/voice-search-button'
import { compressImage } from '@/shared/lib/compress-image'
import jsPDF from 'jspdf'
import { PDFPreview } from '@/shared/components/pdf-preview'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }
const selectSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

const initForm = (): Contrato => ({
  id: '', nro_contrato: '', tipo: 'Venta', fecha: todayFormatted(), cliente_id: '',
  propiedad_id: '', comercial_id: '', tipo_moneda: 'USD', monto: 0, plazo: 0,
  fecha_inicio: '', fecha_fin: '', condiciones: '', observaciones: '', situacion: 'Borrador', imagen: '', documentos: [],
})

export default function ContratosPage() {
  const { contratos, addContrato, updateContrato, deleteContrato } = useContratosStore()
  const clientes = useClientesStore(s => s.clientes)
  const propiedades = usePropiedadesStore(s => s.propiedades)
  const comerciales = useComercialesStore(s => s.comerciales)
  const config = useConfigStore()
  const empresa = useEmpresaStore(s => s.empresa)

  const [form, setForm] = useState<Contrato>(initForm())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState<Contrato | null>(null)
  const [docsRecord, setDocsRecord] = useState<Contrato | null>(null)
  const [search, setSearch] = useState('')
  const [formError, setFormError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfFileName, setPdfFileName] = useState('')

  const nextCode = () => {
    const nums = contratos.map(c => parseInt(c.nro_contrato.replace('CTR-', '')) || 0)
    const max = nums.length > 0 ? Math.max(...nums) : 0
    return `CTR-${String(max + 1).padStart(5, '0')}`
  }

  const monedaSimbolo = (code: string) => {
    const m = config.monedas.find(m => m.nombre === code)
    return m ? m.simbolo : '$'
  }

  const filtered = contratos.filter(c => {
    const cli = clientes.find(cl => cl.id === c.cliente_id)
    const prop = propiedades.find(p => p.id === c.propiedad_id)
    return c.nro_contrato.toLowerCase().includes(search.toLowerCase()) ||
      c.tipo.toLowerCase().includes(search.toLowerCase()) ||
      (cli && `${cli.nombre} ${cli.apellido}`.toLowerCase().includes(search.toLowerCase())) ||
      (prop && prop.urbanizacion.toLowerCase().includes(search.toLowerCase())) ||
      c.situacion.toLowerCase().includes(search.toLowerCase())
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.cliente_id) { setFormError('Seleccione un cliente.'); return }
    if (!form.propiedad_id) { setFormError('Seleccione una propiedad.'); return }
    if (!form.fecha_inicio) { setFormError('Indique la Fecha de Inicio.'); return }
    if (!form.fecha_fin) { setFormError('Indique la Fecha de Finalizacion.'); return }
    if (form.id) { updateContrato(form.id, form) }
    else { addContrato({ ...form, id: crypto.randomUUID(), nro_contrato: nextCode() }) }
    setIsFormOpen(false)
    setForm(initForm())
  }

  const handleEdit = (c: Contrato) => { setForm({ ...c }); setIsFormOpen(true) }
  const handleDelete = (id: string) => { if (confirm('¿Eliminar este contrato?')) deleteContrato(id) }

  const generateContractPDF = (ctr: Contrato) => {
    try {
      const cli = clientes.find(c => c.id === ctr.cliente_id)
      const prop = propiedades.find(p => p.id === ctr.propiedad_id)
      const com = comerciales.find(c => c.id === ctr.comercial_id)

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

      y = 40

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`CONTRATO DE ${ctr.tipo.toUpperCase()} ${ctr.nro_contrato}`, margin, y)
      y += 8

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const lines1 = doc.splitTextToSize(`En la ciudad de ${empresa?.ciudad || '___'}, a fecha ${ctr.fecha}, se celebra el presente contrato de ${ctr.tipo.toLowerCase()} entre:`, contentW)
      doc.text(lines1, margin, y)
      y += lines1.length * 4 + 6

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('PARTE VENDEDORA / ARRENDADORA', margin, y)
      y += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const lines2 = doc.splitTextToSize(`${empresa?.nombre || '___'}, representada por ${empresa?.representante_legal || '___'}, identificado con ${empresa?.tipo_identificacion || ''} ${empresa?.nro_documento || '___'}.`, contentW)
      doc.text(lines2, margin, y)
      y += lines2.length * 4 + 6

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('PARTE COMPRADORA / ARRENDATARIA', margin, y)
      y += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`${cli ? `${cli.nombre} ${cli.apellido}` : '___'}`, margin, y)
      y += 6
      doc.text(`Correo: ${cli?.correo || '-'} | Telefono: ${cli?.telefono || '-'}`, margin, y)
      y += 12

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('PROPIEDAD', margin, y)
      y += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`${prop?.urbanizacion || '___'}`, margin, y)
      y += 6
      doc.text(`Tipo: ${prop?.tipo_propiedad || '-'} | Area: ${fmtNum(prop?.area_m2 || 0)} m²`, margin, y)
      y += 6
      doc.text(`Direccion: ${prop?.direccion || '-'}, ${prop?.ciudad || ''}, ${prop?.zona || ''}`, margin, y)
      y += 12

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('CONDICIONES ECONOMICAS', margin, y)
      y += 6

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`Monto: ${monedaSimbolo(ctr.tipo_moneda)} ${fmtNum(ctr.monto, 2)}`, margin, y)
      y += 8

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      if (ctr.tipo === 'Arrendamiento') {
        doc.text(`Plazo: ${ctr.plazo} meses`, margin, y)
        y += 6
        doc.text(`Fecha Inicio: ${ctr.fecha_inicio} | Fecha Fin: ${ctr.fecha_fin}`, margin, y)
        y += 8
      }
      if (ctr.condiciones) {
        doc.setTextColor(30, 64, 175)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('CONDICIONES', margin, y)
        y += 6
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        const lines3 = doc.splitTextToSize(ctr.condiciones, contentW)
        doc.text(lines3, margin, y)
        y += lines3.length * 4 + 8
      }
      if (ctr.observaciones) {
        doc.setTextColor(30, 64, 175)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('OBSERVACIONES', margin, y)
        y += 6
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        const lines4 = doc.splitTextToSize(ctr.observaciones, contentW)
        doc.text(lines4, margin, y)
        y += lines4.length * 4 + 8
      }
      if (com) {
        doc.text(`Asesor Comercial: ${com.nombre} ${com.apellido}`, margin, y)
      }

      const blob = doc.output('blob') as Blob
      const fileName = `Contrato_${ctr.nro_contrato}.pdf`
      setPdfBlob(blob)
      setPdfFileName(fileName)
      setShowPreview(true)
    } catch (err) {
      alert('Error al generar el PDF: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const generateDocumento = (ctr: Contrato) => {
    try {
      const cli = clientes.find(c => c.id === ctr.cliente_id)
      const prop = propiedades.find(p => p.id === ctr.propiedad_id)
      const com = comerciales.find(c => c.id === ctr.comercial_id)
      const isVenta = ctr.tipo === 'Venta'
      const titulo = isVenta ? 'CONTRATO DE COMPRAVENTA DE INMUEBLE' : 'CONTRATO DE ARRENDAMIENTO DE INMUEBLE'
      const simb = monedaSimbolo(ctr.tipo_moneda)
      const montoFmt = `${simb} ${fmtNum(ctr.monto, 2)} ${ctr.tipo_moneda}`

      const doc = new jsPDF('p', 'mm', 'a4')
      const pageW = 210
      const margin = 20
      const contentW = pageW - margin * 2
      let y = margin

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(titulo, pageW / 2, y, { align: 'center' })
      y += 8
      doc.setFontSize(11)
      doc.text(`Documento Nro. ${ctr.nro_contrato}`, pageW / 2, y, { align: 'center' })
      y += 12

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const lines1 = doc.splitTextToSize(`Conste por el presente documento, el contrato de ${isVenta ? 'compraventa' : 'arrendamiento'} que celebran:`, contentW)
      doc.text(lines1, margin, y)
      y += lines1.length * 4 + 6

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('LAS PARTES', margin, y)
      y += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const vendedorLine = `${isVenta ? 'EL VENDEDOR' : 'EL ARRENDADOR'}: ${empresa?.nombre || '___'}, con ${empresa?.tipo_identificacion || 'identificacion'} Nro. ${empresa?.nro_documento || '___'}, representada por ${empresa?.representante_legal || '___'}, con domicilio en ${empresa?.direccion || '___'}, ${empresa?.ciudad || '___'}.`
      const vendedorLines = doc.splitTextToSize(vendedorLine, contentW)
      doc.text(vendedorLines, margin, y)
      y += vendedorLines.length * 4 + 4

      const compradorLine = `${isVenta ? 'EL COMPRADOR' : 'EL ARRENDATARIO'}: ${cli ? `${cli.nombre} ${cli.apellido}` : '___'}. Correo: ${cli?.correo || '-'}, Telefono: ${cli?.telefono || cli?.movil || '-'}.`
      const compradorLines = doc.splitTextToSize(compradorLine, contentW)
      doc.text(compradorLines, margin, y)
      y += compradorLines.length * 4 + 10

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('CLAUSULA PRIMERA: OBJETO DEL CONTRATO', margin, y)
      y += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const clausula1 = isVenta
        ? `Por medio del presente contrato, EL VENDEDOR transfiere a favor de EL COMPRADOR la propiedad del inmueble descrito en la Clausula Segunda, en las condiciones y terminos aqui establecidos.`
        : `Por medio del presente contrato, EL ARRENDADOR cede en uso a EL ARRENDATARIO el inmueble descrito en la Clausula Segunda, para uso exclusivo de vivienda/oficina, en las condiciones aqui establecidas.`
      const clause1Lines = doc.splitTextToSize(clausula1, contentW)
      doc.text(clause1Lines, margin, y)
      y += clause1Lines.length * 4 + 8

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('CLAUSULA SEGUNDA: DESCRIPCION DEL INMUEBLE', margin, y)
      y += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text('El inmueble objeto del presente contrato se encuentra ubicado en:', margin, y)
      y += 4
      doc.text(`- Urbanizacion: ${prop?.urbanizacion || '___'}`, margin + 4, y)
      y += 4
      doc.text(`- Unidad: ${prop?.nro_apto_casa || '___'}`, margin + 4, y)
      y += 4
      doc.text(`- Direccion: ${prop?.direccion || '___'}`, margin + 4, y)
      y += 4
      doc.text(`- Ciudad/Poblacion: ${prop?.ciudad || '___'}, Zona: ${prop?.zona || '___'}`, margin + 4, y)
      y += 4
      doc.text(`- Tipo de Propiedad: ${prop?.tipo_propiedad || '___'}`, margin + 4, y)
      y += 4
      doc.text(`- Area: ${fmtNum(prop?.area_m2 || 0)} m²`, margin + 4, y)
      y += 4
      doc.text(`- Habitaciones: ${prop?.habitaciones || 0} | Banos: ${prop?.banos || 0} | Estacionamientos: ${prop?.estacionamientos || 0}`, margin + 4, y)
      y += 10

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(isVenta ? 'CLAUSULA TERCERA: PRECIO Y FORMA DE PAGO' : 'CLAUSULA TERCERA: PLAZO DEL CONTRATO', margin, y)
      y += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      if (isVenta) {
        const clause3 = `El precio total de la compraventa es de ${montoFmt} (${ctr.tipo_moneda}), que EL COMPRADOR se compromete a pagar de la siguiente forma: ${ctr.condiciones || 'Pago unico al momento de la firma de la escritura publica.'}`
        const clause3Lines = doc.splitTextToSize(clause3, contentW)
        doc.text(clause3Lines, margin, y)
        y += clause3Lines.length * 4 + 8
      } else {
        const clause3 = `El plazo del presente contrato es de ${ctr.plazo} meses, iniciando el ${ctr.fecha_inicio || '___'} y finalizando el ${ctr.fecha_fin || '___'}. Al vencimiento, las partes podran acordar su renovacion por escrito.`
        const clause3Lines = doc.splitTextToSize(clause3, contentW)
        doc.text(clause3Lines, margin, y)
        y += clause3Lines.length * 4 + 8
      }

      if (ctr.observaciones) {
        doc.setTextColor(30, 64, 175)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('OBSERVACIONES ADICIONALES', margin, y)
        y += 6
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        const obsLines = doc.splitTextToSize(ctr.observaciones, contentW)
        doc.text(obsLines, margin, y)
        y += obsLines.length * 4 + 8
      }

      doc.setTextColor(30, 64, 175)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('CLAUSULA FINAL: JURISDICCION', margin, y)
      y += 6

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const clausulaFinal = `Para cualquier controversia derivada del presente contrato, las partes se someten a la jurisdiccion de los juzgados y tribunales de ${empresa?.ciudad || '___'}, renunciando a cualquier otro fuero que pudiera corresponderles.`
      const clausulaFinalLines = doc.splitTextToSize(clausulaFinal, contentW)
      doc.text(clausulaFinalLines, margin, y)
      y += clausulaFinalLines.length * 4 + 10

      const clausulaConformidad = `En senal de conformidad, las partes suscriben el presente documento en la ciudad de ${empresa?.ciudad || '___'}, a los ${ctr.fecha || '___'}.`
      const clausulaConformidadLines = doc.splitTextToSize(clausulaConformidad, contentW)
      doc.text(clausulaConformidadLines, margin, y)

      const blob = doc.output('blob') as Blob
      const fileName = `Documento_${ctr.nro_contrato}.pdf`
      setPdfBlob(blob)
      setPdfFileName(fileName)
      setShowPreview(true)
    } catch (err) {
      alert('Error al generar el PDF: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, { bg: string; color: string; border: string }> = {
      'Borrador': { bg: 'rgba(245,158,11,0.2)', color: '#60a5fa', border: '1px solid rgba(245,158,11,0.3)' },
      'Vigente': { bg: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' },
      'Finalizado': { bg: 'rgba(29,78,216,0.2)', color: '#3b82f6', border: '1px solid rgba(29,78,216,0.3)' },
      'Cancelado': { bg: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
    }
    const c = colors[s] || { bg: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }
    return <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: c.bg, color: c.color, border: c.border }}>{s}</span>
  }

  const headers = ['Nro', 'Tipo', 'Fecha', 'Cliente', 'Propiedad', 'Monto', 'Plazo', 'Situacion']
  const rows = filtered.map(c => {
    const cli = clientes.find(cl => cl.id === c.cliente_id)
    const prop = propiedades.find(p => p.id === c.propiedad_id)
    return [c.nro_contrato, c.tipo, c.fecha, cli ? `${cli.nombre} ${cli.apellido}` : '',
      prop?.urbanizacion || '', `${monedaSimbolo(c.tipo_moneda)} ${fmtNum(c.monto, 2)}`,
      c.tipo === 'Arrendamiento' ? `${c.plazo} meses` : '-', c.situacion]
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Contratos</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => exportToPDF('Contratos', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(220,38,38,0.85)', border: '1px solid rgba(220,38,38,1)', color: '#fff' }}>PDF</button>
          <button onClick={() => exportToExcel(filtered.map(c => { const cli = clientes.find(cl => cl.id === c.cliente_id); const prop = propiedades.find(p => p.id === c.propiedad_id); return { Nro: c.nro_contrato, Tipo: c.tipo, Fecha: c.fecha, Cliente: cli ? `${cli.nombre} ${cli.apellido}` : '', Propiedad: prop?.urbanizacion || '', Monto: c.monto, Moneda: c.tipo_moneda, Situacion: c.situacion } }), 'Contratos')} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(22,163,74,0.85)', border: '1px solid rgba(22,163,74,1)', color: '#fff' }}>Excel</button>
          <button onClick={() => printTable('Contratos', headers, rows)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'rgba(202,138,4,0.9)', border: '1px solid rgba(202,138,4,1)', color: '#fff' }}>Imprimir</button>
          <button onClick={() => { setForm(initForm()); setIsFormOpen(true) }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>+ Nuevo Contrato</button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contratos..." className="flex-1 rounded-lg px-4 py-2 text-sm outline-none" style={inputSt} />
        <VoiceSearchButton onResult={setSearch} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Nro', 'Tipo', 'Fecha', 'Cliente', 'Propiedad', 'F. Inicio', 'F. Fin', 'Monto', 'Situacion', 'Acciones'].map(h => (
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
                    <td className="px-4 py-3 font-mono text-xs text-white/60">{c.nro_contrato}</td>
                    <td className="px-4 py-3 text-white/70">{c.tipo}</td>
                    <td className="px-4 py-3 text-white/70">{c.fecha}</td>
                    <td className="px-4 py-3 text-white">{cli ? `${cli.nombre} ${cli.apellido}` : '-'}</td>
                    <td className="px-4 py-3 text-white/70">{prop?.urbanizacion || '-'}</td>
                    <td className="px-4 py-3 text-white/60">{c.fecha_inicio || '-'}</td>
                    <td className="px-4 py-3 text-white/60">{c.fecha_fin || '-'}</td>
                    <td className="px-4 py-3 text-white font-semibold">{monedaSimbolo(c.tipo_moneda)} {fmtNum(c.monto, 2)}</td>
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
              {filtered.length === 0 && <tr><td colSpan={10} className="px-4 py-8 text-center text-white/30">No hay contratos registrados</td></tr>}
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
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: '#ffffff', border: '2px solid #000000' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-black">Contrato {viewRecord.nro_contrato}</h2>
                <button onClick={() => setViewRecord(null)} className="text-black/60 hover:text-black text-xl">✕</button>
              </div>
              {viewRecord.imagen && (
                <div className="flex justify-center mb-4">
                  <img src={viewRecord.imagen} alt="Foto" className="max-h-40 rounded-xl object-contain" style={{ border: '1px solid #d1d5db' }} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Tipo', value: viewRecord.tipo },
                  { label: 'Fecha', value: viewRecord.fecha },
                  { label: 'Cliente', value: cli ? `${cli.nombre} ${cli.apellido}` : '-' },
                  { label: 'Propiedad', value: prop?.urbanizacion || '-' },
                  { label: 'Comercial', value: com ? `${com.nombre} ${com.apellido}` : '-' },
                  { label: 'Monto', value: `${monedaSimbolo(viewRecord.tipo_moneda)} ${fmtNum(viewRecord.monto, 2)}` },
                  { label: 'Plazo', value: viewRecord.tipo === 'Arrendamiento' ? `${viewRecord.plazo} meses` : 'N/A' },
                  { label: 'Fecha Inicio', value: viewRecord.fecha_inicio || '-' },
                  { label: 'Fecha Fin', value: viewRecord.fecha_fin || '-' },
                  { label: 'Situacion', value: viewRecord.situacion },
                ].map(f => (
                  <div key={f.label}><p className="text-xs text-gray-600">{f.label}</p><p className="text-sm text-black">{f.value || '-'}</p></div>
                ))}
              </div>
              {viewRecord.condiciones && <div className="mt-3"><p className="text-xs text-gray-600">Condiciones</p><p className="text-sm text-black">{viewRecord.condiciones}</p></div>}
              {viewRecord.observaciones && <div className="mt-3"><p className="text-xs text-gray-600">Observaciones</p><p className="text-sm text-black">{viewRecord.observaciones}</p></div>}
            </div>
          </div>
        )
      })()}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: '#ffffff', border: '2px solid #000000' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black">{form.id ? 'Editar Contrato' : 'Nuevo Contrato'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-black/60 hover:text-black text-xl">✕</button>
            </div>
            {formError && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#ffebee', border: '1px solid #ef5350', color: '#c62828' }}>{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Nro. Contrato</label>
                  <input type="text" readOnly value={form.id ? form.nro_contrato : nextCode()} className="w-full rounded-lg px-3 py-2 text-sm outline-none font-mono font-bold cursor-not-allowed" style={{ ...inputSt, opacity: 0.7 }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Fecha</label>
                  <input type="date" value={toInputDate(form.fecha)} onChange={e => setForm(f => ({ ...f, fecha: formatDate(e.target.value) }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Venta">Venta</option>
                    <option value="Arrendamiento">Arrendamiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Cliente *</label>
                  <select value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Propiedad *</label>
                  <select value={form.propiedad_id} onChange={e => setForm(f => ({ ...f, propiedad_id: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {propiedades.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.urbanizacion}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Comercial</label>
                  <select value={form.comercial_id} onChange={e => setForm(f => ({ ...f, comercial_id: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {comerciales.filter(c => c.situacion === 'Activo').map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Tipo Moneda</label>
                  <select value={form.tipo_moneda} onChange={e => setForm(f => ({ ...f, tipo_moneda: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    {config.monedas.map(m => <option key={m.id} value={m.nombre}>{m.nombre} ({m.simbolo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Monto</label>
                  <input type="number" min="0" step="0.01" value={form.monto || ''} onChange={e => setForm(f => ({ ...f, monto: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Fecha Inicio *</label>
                  <input type="date" value={toInputDate(form.fecha_inicio)} onChange={e => setForm(f => ({ ...f, fecha_inicio: formatDate(e.target.value) }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Fecha Finalizacion *</label>
                  <input type="date" value={toInputDate(form.fecha_fin)} onChange={e => setForm(f => ({ ...f, fecha_fin: formatDate(e.target.value) }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                {form.tipo === 'Arrendamiento' && (
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Plazo (meses)</label>
                    <input type="number" min="0" value={form.plazo || ''} onChange={e => setForm(f => ({ ...f, plazo: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700">Situacion</label>
                  <select value={form.situacion} onChange={e => setForm(f => ({ ...f, situacion: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Borrador">Borrador</option>
                    <option value="Vigente">Vigente</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Condiciones</label>
                <textarea value={form.condiciones} onChange={e => setForm(f => ({ ...f, condiciones: e.target.value }))} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Observaciones</label>
                <textarea value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} rows={2} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
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
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-lg text-sm" style={{ background: '#f3f4f6', border: '1px solid #d1d5db', color: '#374151' }}>Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documentos Modal */}
      {docsRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: '#ffffff', border: '2px solid #000000' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black">Documentos - {docsRecord.nro_contrato}</h2>
              <button onClick={() => setDocsRecord(null)} className="text-black/60 hover:text-black text-xl">✕</button>
            </div>

            {/* Upload */}
            <div className="mb-6">
              <label className="cursor-pointer px-4 py-2 rounded-lg text-xs font-bold text-white inline-flex items-center gap-2" style={{ background: 'rgba(139,92,246,0.7)', border: '1px solid rgba(139,92,246,0.9)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Subir Documento
                <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp" className="hidden" onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (file.size > 5 * 1024 * 1024) { alert('El archivo no puede superar 5 MB.'); return }
                  const reader = new FileReader()
                  reader.onload = (ev) => {
                    const newDoc = {
                      id: crypto.randomUUID(),
                      nombre: file.name,
                      tipo: file.type,
                      fecha: new Date().toLocaleDateString('es-ES'),
                      data: ev.target?.result as string,
                    }
                    const updated = { ...docsRecord, documentos: [...(docsRecord.documentos || []), newDoc] }
                    updateContrato(docsRecord.id, updated)
                    setDocsRecord(updated)
                  }
                  reader.readAsDataURL(file)
                  if (e.target) e.target.value = ''
                }} />
              </label>
              <span className="text-xs text-gray-600 ml-3">PDF, Word, Excel, Imagenes (max 5 MB)</span>
            </div>

            {/* Document list */}
            <div className="space-y-2">
              {(docsRecord.documentos || []).length === 0 && (
                <p className="text-center text-gray-400 py-8">No hay documentos adjuntos</p>
              )}
              {(docsRecord.documentos || []).map(doc => {
                const isImage = doc.tipo.startsWith('image/')
                const isPdf = doc.tipo === 'application/pdf'
                const icon = isImage ? '🖼️' : isPdf ? '📄' : doc.tipo.includes('word') ? '📝' : doc.tipo.includes('sheet') || doc.tipo.includes('excel') ? '📊' : '📎'
                return (
                  <div key={doc.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: '#f3f4f6', border: '1px solid #d1d5db' }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg">{icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-black truncate">{doc.nombre}</p>
                        <p className="text-xs text-gray-600">{doc.fecha}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => {
                        if (isImage) {
                          const w = window.open('', '_blank')
                          if (w) { w.document.write(`<img src="${doc.data}" style="max-width:100%"/>`); w.document.close() }
                        } else {
                          const a = document.createElement('a')
                          a.href = doc.data
                          a.download = doc.nombre
                          a.click()
                        }
                      }} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: 'rgba(4,120,87,0.9)', border: '1px solid rgba(4,120,87,1)', color: '#fff' }}>
                        {isImage ? 'Ver' : 'Descargar'}
                      </button>
                      <button onClick={() => {
                        const updated = { ...docsRecord, documentos: (docsRecord.documentos || []).filter(d => d.id !== doc.id) }
                        updateContrato(docsRecord.id, updated)
                        setDocsRecord(updated)
                      }} className="p-1.5 rounded-lg hover:bg-white/10" title="Eliminar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
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
  )
}
