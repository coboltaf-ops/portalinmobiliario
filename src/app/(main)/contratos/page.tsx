'use client'

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

const inputSt: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }
const selectSt: React.CSSProperties = { background: 'rgba(41,15,5,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }

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
    const cli = clientes.find(c => c.id === ctr.cliente_id)
    const prop = propiedades.find(p => p.id === ctr.propiedad_id)
    const com = comerciales.find(c => c.id === ctr.comercial_id)
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>Contrato ${ctr.nro_contrato}</title></head>
    <body style="font-family:Arial;padding:40px;max-width:800px;margin:0 auto">
      <div style="text-align:center;margin-bottom:30px">
        ${empresa?.logo ? `<img src="${empresa.logo}" style="height:60px;margin-bottom:10px" />` : ''}
        <h1 style="margin:0;color:#1e3a5f">${empresa?.nombre || 'Portal Inmobiliario'}</h1>
        <p style="color:#666">${empresa?.direccion || ''} ${empresa?.ciudad || ''}</p>
      </div>
      <h2 style="color:#1e3a5f;border-bottom:2px solid #3b82f6;padding-bottom:10px">CONTRATO DE ${ctr.tipo.toUpperCase()} ${ctr.nro_contrato}</h2>
      <p>En la ciudad de ${empresa?.ciudad || '___'}, a fecha ${ctr.fecha}, se celebra el presente contrato de ${ctr.tipo.toLowerCase()} entre:</p>
      <h3 style="color:#1e3a5f">PARTE VENDEDORA / ARRENDADORA</h3>
      <p><strong>${empresa?.nombre || '___'}</strong>, representada por ${empresa?.representante_legal || '___'}, identificado con ${empresa?.tipo_identificacion || ''} ${empresa?.nro_documento || '___'}.</p>
      <h3 style="color:#1e3a5f">PARTE COMPRADORA / ARRENDATARIA</h3>
      <p><strong>${cli ? `${cli.nombre} ${cli.apellido}` : '___'}</strong></p>
      <p>Correo: ${cli?.correo || '-'} | Telefono: ${cli?.telefono || '-'}</p>
      <h3 style="color:#1e3a5f">PROPIEDAD</h3>
      <p><strong>${prop?.urbanizacion || '___'}</strong></p>
      <p>Tipo: ${prop?.tipo_propiedad || '-'} | Area: ${fmtNum(prop?.area_m2 || 0)} m²</p>
      <p>Direccion: ${prop?.direccion || '-'}, ${prop?.ciudad || ''}, ${prop?.zona || ''}</p>
      <h3 style="color:#1e3a5f">CONDICIONES ECONOMICAS</h3>
      <p style="font-size:20px;font-weight:bold;color:#1e3a5f">Monto: ${monedaSimbolo(ctr.tipo_moneda)} ${fmtNum(ctr.monto, 2)}</p>
      ${ctr.tipo === 'Arrendamiento' ? `<p><strong>Plazo:</strong> ${ctr.plazo} meses</p><p><strong>Fecha Inicio:</strong> ${ctr.fecha_inicio} | <strong>Fecha Fin:</strong> ${ctr.fecha_fin}</p>` : ''}
      ${ctr.condiciones ? `<h3 style="color:#1e3a5f">CONDICIONES</h3><p>${ctr.condiciones}</p>` : ''}
      ${ctr.observaciones ? `<h3 style="color:#1e3a5f">OBSERVACIONES</h3><p>${ctr.observaciones}</p>` : ''}
      ${com ? `<p style="margin-top:20px"><strong>Asesor Comercial:</strong> ${com.nombre} ${com.apellido}</p>` : ''}
      <div style="margin-top:60px;display:flex;justify-content:space-between">
        <div style="text-align:center"><div style="border-top:1px solid #000;width:200px;padding-top:5px">Parte Vendedora/Arrendadora</div></div>
        <div style="text-align:center"><div style="border-top:1px solid #000;width:200px;padding-top:5px">Parte Compradora/Arrendataria</div></div>
      </div>
      <script>setTimeout(()=>window.print(),500)</script>
    </body></html>`)
    w.document.close()
  }

  const generateDocumento = (ctr: Contrato) => {
    const cli = clientes.find(c => c.id === ctr.cliente_id)
    const prop = propiedades.find(p => p.id === ctr.propiedad_id)
    const com = comerciales.find(c => c.id === ctr.comercial_id)
    const w = window.open('', '_blank')
    if (!w) return
    const isVenta = ctr.tipo === 'Venta'
    const titulo = isVenta ? 'CONTRATO DE COMPRAVENTA DE INMUEBLE' : 'CONTRATO DE ARRENDAMIENTO DE INMUEBLE'
    const simb = monedaSimbolo(ctr.tipo_moneda)
    const montoFmt = `${simb} ${fmtNum(ctr.monto, 2)} ${ctr.tipo_moneda}`

    const clausulasVenta = `
      <h3>CLAUSULA PRIMERA: OBJETO DEL CONTRATO</h3>
      <p>Por medio del presente contrato, <strong>EL VENDEDOR</strong> transfiere a favor de <strong>EL COMPRADOR</strong> la propiedad del inmueble descrito en la Clausula Segunda, en las condiciones y terminos aqui establecidos.</p>

      <h3>CLAUSULA SEGUNDA: DESCRIPCION DEL INMUEBLE</h3>
      <p>El inmueble objeto del presente contrato se encuentra ubicado en:</p>
      <ul>
        <li><strong>Urbanizacion:</strong> ${prop?.urbanizacion || '___'}</li>
        <li><strong>Unidad:</strong> ${prop?.nro_apto_casa || '___'}</li>
        <li><strong>Direccion:</strong> ${prop?.direccion || '___'}</li>
        <li><strong>Ciudad/Poblacion:</strong> ${prop?.ciudad || '___'}, Zona: ${prop?.zona || '___'}</li>
        <li><strong>Tipo de Propiedad:</strong> ${prop?.tipo_propiedad || '___'}</li>
        <li><strong>Area:</strong> ${fmtNum(prop?.area_m2 || 0)} m²</li>
        <li><strong>Habitaciones:</strong> ${prop?.habitaciones || 0} | <strong>Banos:</strong> ${prop?.banos || 0} | <strong>Estacionamientos:</strong> ${prop?.estacionamientos || 0}</li>
      </ul>

      <h3>CLAUSULA TERCERA: PRECIO Y FORMA DE PAGO</h3>
      <p>El precio total de la compraventa es de <strong>${montoFmt}</strong> (${ctr.tipo_moneda}), que EL COMPRADOR se compromete a pagar de la siguiente forma:</p>
      <p>${ctr.condiciones || 'Pago unico al momento de la firma de la escritura publica.'}</p>

      <h3>CLAUSULA CUARTA: ENTREGA DEL INMUEBLE</h3>
      <p>EL VENDEDOR se compromete a entregar el inmueble a EL COMPRADOR en la fecha <strong>${ctr.fecha_inicio || '___'}</strong>, libre de gravamenes, cargas, deudas, inquilinos y ocupantes.</p>

      <h3>CLAUSULA QUINTA: SANEAMIENTO</h3>
      <p>EL VENDEDOR declara que el inmueble se encuentra libre de todo gravamen, hipoteca, embargo, litigio, proceso judicial o carga de cualquier naturaleza. Se obliga al saneamiento por eviccion y por vicios ocultos conforme a ley.</p>

      <h3>CLAUSULA SEXTA: GASTOS</h3>
      <p>Los gastos notariales, registrales e impuestos que genere la presente transferencia seran asumidos por ambas partes en proporcion igual, salvo acuerdo distinto.</p>

      <h3>CLAUSULA SEPTIMA: VIGENCIA</h3>
      <p>El presente contrato entra en vigencia a partir de la fecha de su suscripcion: <strong>${ctr.fecha}</strong>.</p>
    `

    const clausulasAlquiler = `
      <h3>CLAUSULA PRIMERA: OBJETO DEL CONTRATO</h3>
      <p>Por medio del presente contrato, <strong>EL ARRENDADOR</strong> cede en uso a <strong>EL ARRENDATARIO</strong> el inmueble descrito en la Clausula Segunda, para uso exclusivo de vivienda/oficina, en las condiciones aqui establecidas.</p>

      <h3>CLAUSULA SEGUNDA: DESCRIPCION DEL INMUEBLE</h3>
      <p>El inmueble objeto del presente contrato se encuentra ubicado en:</p>
      <ul>
        <li><strong>Urbanizacion:</strong> ${prop?.urbanizacion || '___'}</li>
        <li><strong>Unidad:</strong> ${prop?.nro_apto_casa || '___'}</li>
        <li><strong>Direccion:</strong> ${prop?.direccion || '___'}</li>
        <li><strong>Ciudad/Poblacion:</strong> ${prop?.ciudad || '___'}, Zona: ${prop?.zona || '___'}</li>
        <li><strong>Tipo de Propiedad:</strong> ${prop?.tipo_propiedad || '___'}</li>
        <li><strong>Area:</strong> ${fmtNum(prop?.area_m2 || 0)} m²</li>
        <li><strong>Habitaciones:</strong> ${prop?.habitaciones || 0} | <strong>Banos:</strong> ${prop?.banos || 0} | <strong>Estacionamientos:</strong> ${prop?.estacionamientos || 0}</li>
      </ul>

      <h3>CLAUSULA TERCERA: PLAZO DEL CONTRATO</h3>
      <p>El plazo del presente contrato es de <strong>${ctr.plazo} meses</strong>, iniciando el <strong>${ctr.fecha_inicio || '___'}</strong> y finalizando el <strong>${ctr.fecha_fin || '___'}</strong>. Al vencimiento, las partes podran acordar su renovacion por escrito.</p>

      <h3>CLAUSULA CUARTA: RENTA MENSUAL</h3>
      <p>EL ARRENDATARIO se obliga a pagar una renta mensual de <strong>${montoFmt}</strong>, pagadera dentro de los primeros cinco (5) dias de cada mes, mediante transferencia bancaria o medio acordado.</p>

      <h3>CLAUSULA QUINTA: GARANTIA / DEPOSITO</h3>
      <p>EL ARRENDATARIO entregara al momento de la firma un deposito de garantia equivalente a dos (2) meses de renta, que sera devuelto al termino del contrato, previa verificacion del estado del inmueble. ${ctr.condiciones || ''}</p>

      <h3>CLAUSULA SEXTA: OBLIGACIONES DEL ARRENDATARIO</h3>
      <p>a) Usar el inmueble exclusivamente para el fin acordado.<br/>
      b) Mantener el inmueble en buen estado de conservacion.<br/>
      c) No realizar modificaciones estructurales sin autorizacion escrita.<br/>
      d) Pagar puntualmente los servicios publicos (agua, luz, gas, internet).<br/>
      e) No subarrendar total o parcialmente sin autorizacion.</p>

      <h3>CLAUSULA SEPTIMA: OBLIGACIONES DEL ARRENDADOR</h3>
      <p>a) Entregar el inmueble en condiciones habitables.<br/>
      b) Realizar las reparaciones mayores necesarias.<br/>
      c) Garantizar el uso pacifico del inmueble.<br/>
      d) Respetar el plazo del contrato.</p>

      <h3>CLAUSULA OCTAVA: TERMINACION ANTICIPADA</h3>
      <p>Cualquiera de las partes podra resolver el contrato anticipadamente, notificando por escrito con treinta (30) dias de anticipacion. En caso de resolucion anticipada por EL ARRENDATARIO, perdera el deposito de garantia.</p>
    `

    w.document.write(`<!DOCTYPE html><html><head><title>${titulo} - ${ctr.nro_contrato}</title>
    <style>
      body { font-family: 'Georgia', 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 50px 60px; color: #1a1a1a; line-height: 1.7; font-size: 13px; }
      h1 { text-align: center; font-size: 18px; color: #1e3a5f; margin-bottom: 5px; letter-spacing: 2px; }
      h2 { text-align: center; font-size: 14px; color: #333; font-weight: normal; margin-top: 0; }
      h3 { color: #1e3a5f; font-size: 13px; margin-top: 25px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
      p { text-align: justify; margin: 8px 0; }
      ul { margin: 8px 0; padding-left: 25px; }
      li { margin: 4px 0; }
      .header { text-align: center; margin-bottom: 40px; border-bottom: 3px double #1e3a5f; padding-bottom: 20px; }
      .header img { height: 70px; margin-bottom: 10px; }
      .firma { margin-top: 80px; display: flex; justify-content: space-between; }
      .firma-box { text-align: center; width: 250px; }
      .firma-linea { border-top: 1px solid #000; padding-top: 8px; font-size: 12px; font-weight: bold; }
      .firma-sub { font-size: 11px; color: #666; margin-top: 2px; }
      .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; }
      @media print { body { padding: 30px 40px; } }
    </style></head>
    <body>
      <div class="header">
        ${empresa?.logo ? `<img src="${empresa.logo}" />` : ''}
        <h1>${titulo}</h1>
        <h2>Documento Nro. ${ctr.nro_contrato}</h2>
      </div>

      <p>Conste por el presente documento, el contrato de ${isVenta ? 'compraventa' : 'arrendamiento'} que celebran:</p>

      <h3>LAS PARTES</h3>
      <p><strong>${isVenta ? 'EL VENDEDOR' : 'EL ARRENDADOR'}:</strong> ${empresa?.nombre || '___'}, con ${empresa?.tipo_identificacion || 'identificacion'} Nro. ${empresa?.nro_documento || '___'}, representada por ${empresa?.representante_legal || '___'}, con domicilio en ${empresa?.direccion || '___'}, ${empresa?.ciudad || '___'}.</p>
      <p><strong>${isVenta ? 'EL COMPRADOR' : 'EL ARRENDATARIO'}:</strong> ${cli ? `${cli.nombre} ${cli.apellido}` : '___'}. Correo: ${cli?.correo || '-'}, Telefono: ${cli?.telefono || cli?.movil || '-'}.</p>

      ${isVenta ? clausulasVenta : clausulasAlquiler}

      ${ctr.observaciones ? `<h3>OBSERVACIONES ADICIONALES</h3><p>${ctr.observaciones}</p>` : ''}

      <h3>CLAUSULA FINAL: JURISDICCION</h3>
      <p>Para cualquier controversia derivada del presente contrato, las partes se someten a la jurisdiccion de los juzgados y tribunales de ${empresa?.ciudad || '___'}, renunciando a cualquier otro fuero que pudiera corresponderles.</p>

      <p style="margin-top:30px">En senal de conformidad, las partes suscriben el presente documento en la ciudad de ${empresa?.ciudad || '___'}, a los ${ctr.fecha || '___'}.</p>

      ${com ? `<p style="margin-top:15px; font-size:12px; color:#666"><strong>Asesor Comercial:</strong> ${com.nombre} ${com.apellido} | ${com.correo || ''} | ${com.movil || ''}</p>` : ''}

      <div class="firma">
        <div class="firma-box">
          <div class="firma-linea">${isVenta ? 'EL VENDEDOR' : 'EL ARRENDADOR'}</div>
          <div class="firma-sub">${empresa?.representante_legal || '___'}</div>
          <div class="firma-sub">${empresa?.nombre || '___'}</div>
        </div>
        <div class="firma-box">
          <div class="firma-linea">${isVenta ? 'EL COMPRADOR' : 'EL ARRENDATARIO'}</div>
          <div class="firma-sub">${cli ? `${cli.nombre} ${cli.apellido}` : '___'}</div>
          <div class="firma-sub">${cli?.correo || '___'}</div>
        </div>
      </div>

      <div class="footer">
        <p>${empresa?.nombre || 'Portal Inmobiliario'} | ${empresa?.direccion || ''} | ${empresa?.telefono || ''}</p>
        <p>Documento generado el ${new Date().toLocaleDateString('es-PE')} - ${ctr.nro_contrato}</p>
      </div>

      <script>setTimeout(()=>window.print(),800)</script>
    </body></html>`)
    w.document.close()
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
                        <button onClick={() => setViewRecord(c)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: 'rgba(4,120,87,0.9)', border: '1px solid rgba(4,120,87,1)', color: '#fff' }}>Ver</button>
                        <button onClick={() => setDocsRecord(c)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: 'rgba(139,92,246,0.9)', border: '1px solid rgba(139,92,246,1)', color: '#fff' }}>Docs</button>
                        <button onClick={() => generateDocumento(c)} className="px-2 py-1 rounded-lg text-xs font-medium hover:opacity-90" style={{ background: 'rgba(30,64,175,0.9)', border: '1px solid rgba(30,64,175,1)', color: '#fff' }} title="Documento Compra Venta / Alquiler">Doc</button>
                        <button onClick={() => generateContractPDF(c)} className="p-1.5 rounded-lg hover:bg-white/10" title="PDF Contrato"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>
                        <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-white/10" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-white/10" title="Eliminar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
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
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Contrato {viewRecord.nro_contrato}</h2>
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
                  <div key={f.label}><p className="text-xs text-white/40">{f.label}</p><p className="text-sm text-white">{f.value || '-'}</p></div>
                ))}
              </div>
              {viewRecord.condiciones && <div className="mt-3"><p className="text-xs text-white/40">Condiciones</p><p className="text-sm text-white">{viewRecord.condiciones}</p></div>}
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
              <h2 className="text-lg font-bold text-white">{form.id ? 'Editar Contrato' : 'Nuevo Contrato'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>
            {formError && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Nro. Contrato</label>
                  <input type="text" readOnly value={form.id ? form.nro_contrato : nextCode()} className="w-full rounded-lg px-3 py-2 text-sm outline-none font-mono font-bold cursor-not-allowed" style={{ ...inputSt, opacity: 0.7 }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Fecha</label>
                  <input type="date" value={toInputDate(form.fecha)} onChange={e => setForm(f => ({ ...f, fecha: formatDate(e.target.value) }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Tipo</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Venta">Venta</option>
                    <option value="Arrendamiento">Arrendamiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Cliente *</label>
                  <select value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Propiedad *</label>
                  <select value={form.propiedad_id} onChange={e => setForm(f => ({ ...f, propiedad_id: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="">Seleccionar...</option>
                    {propiedades.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.urbanizacion}</option>)}
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
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Monto</label>
                  <input type="number" min="0" step="0.01" value={form.monto || ''} onChange={e => setForm(f => ({ ...f, monto: parseFloat(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Fecha Inicio *</label>
                  <input type="date" value={toInputDate(form.fecha_inicio)} onChange={e => setForm(f => ({ ...f, fecha_inicio: formatDate(e.target.value) }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Fecha Finalizacion *</label>
                  <input type="date" value={toInputDate(form.fecha_fin)} onChange={e => setForm(f => ({ ...f, fecha_fin: formatDate(e.target.value) }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                {form.tipo === 'Arrendamiento' && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Plazo (meses)</label>
                    <input type="number" min="0" value={form.plazo || ''} onChange={e => setForm(f => ({ ...f, plazo: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Situacion</label>
                  <select value={form.situacion} onChange={e => setForm(f => ({ ...f, situacion: e.target.value }))} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={selectSt}>
                    <option value="Borrador">Borrador</option>
                    <option value="Vigente">Vigente</option>
                    <option value="Finalizado">Finalizado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Condiciones</label>
                <textarea value={form.condiciones} onChange={e => setForm(f => ({ ...f, condiciones: e.target.value }))} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} />
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

      {/* Documentos Modal */}
      {docsRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Documentos - {docsRecord.nro_contrato}</h2>
              <button onClick={() => setDocsRecord(null)} className="text-white/60 hover:text-white text-xl">✕</button>
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
              <span className="text-xs text-white/40 ml-3">PDF, Word, Excel, Imagenes (max 5 MB)</span>
            </div>

            {/* Document list */}
            <div className="space-y-2">
              {(docsRecord.documentos || []).length === 0 && (
                <p className="text-center text-white/30 py-8">No hay documentos adjuntos</p>
              )}
              {(docsRecord.documentos || []).map(doc => {
                const isImage = doc.tipo.startsWith('image/')
                const isPdf = doc.tipo === 'application/pdf'
                const icon = isImage ? '🖼️' : isPdf ? '📄' : doc.tipo.includes('word') ? '📝' : doc.tipo.includes('sheet') || doc.tipo.includes('excel') ? '📊' : '📎'
                return (
                  <div key={doc.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg">{icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{doc.nombre}</p>
                        <p className="text-xs text-white/40">{doc.fecha}</p>
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
    </div>
  )
}
