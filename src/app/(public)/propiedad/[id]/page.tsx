'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePropiedadesStore } from '@/features/propiedades/store/propiedades-store'
import { useComercialesStore } from '@/features/comerciales/store/comerciales-store'
import { useConfigStore } from '@/features/configuracion/store/configuracion-store'
import { useSolicitudesStore } from '@/features/solicitudes/store/solicitudes-store'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'
import { supabase } from '@/shared/lib/supabase'
import { fmtNum } from '@/shared/lib/format-date'

const modalidadStyle = (m: string): React.CSSProperties => {
  if (m === 'Venta') return { background: '#dcfce7', color: '#16a34a' }
  if (m === 'Alquiler') return { background: '#dbeafe', color: '#2563eb' }
  if (m === 'Venta y Alquiler') return { background: '#ede9fe', color: '#7c3aed' }
  return { background: '#f1f5f9', color: '#475569' }
}

export default function PropiedadDetallePage() {
  const params = useParams()
  const router = useRouter()
  const propiedades = usePropiedadesStore(s => s.propiedades)
  const comerciales = useComercialesStore(s => s.comerciales)
  const config = useConfigStore()
  const empresa = useEmpresaStore(s => s.empresa)
  const { solicitudes, addSolicitud } = useSolicitudesStore()

  const propiedad = propiedades.find(p => p.id === params.id)
  const [galleryIndex, setGalleryIndex] = useState(0)

  // Contact form
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [formError, setFormError] = useState('')

  const monedaSimbolo = (code: string) => {
    const m = config.monedas.find(m => m.nombre === code)
    return m ? m.simbolo : '$'
  }

  const nextCode = async () => {
    const { data } = await (supabase as any).from('solicitudes').select('codigo').order('codigo', { ascending: false }).limit(1)
    const maxCode = data && data.length > 0 ? (data[0] as any).codigo : 'SOL-00000'
    const max = parseInt(String(maxCode).replace('SOL-', '')) || 0
    return `SOL-${String(max + 1).padStart(5, '0')}`
  }

  const todayFormatted = () => {
    const d = new Date()
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!nombre.trim()) { setFormError('El nombre es obligatorio.'); return }
    if (!correo.trim() && !telefono.trim()) { setFormError('Debe ingresar correo o telefono.'); return }

    try {
      const codigo = await nextCode()
      await addSolicitud({
        id: crypto.randomUUID(),
        codigo,
        fecha: todayFormatted(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
        mensaje: mensaje.trim(),
        origen: 'Pagina Web',
        propiedad_id: propiedad!.id,
        estado: 'Nueva',
        comercial_asignado: propiedad!.asesor_asignado || '',
        notas: '',
      })

      setEnviado(true)
      setNombre('')
      setApellido('')
      setCorreo('')
      setTelefono('')
      setMensaje('')
    } catch (err) {
      setFormError('Error al enviar: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  if (!propiedad) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#fef2f2' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
        </div>
        <p className="text-lg font-bold mb-4" style={{ color: '#0f172a' }}>Propiedad no encontrada</p>
        <Link href="/catalogo" className="text-sm font-bold hover:underline" style={{ color: '#2563eb' }}>← Volver al catálogo</Link>
      </div>
    )
  }

  const asesor = comerciales.find(c => c.id === propiedad.asesor_asignado)
  const imgs = propiedad.imagenes || []
  const inputSt: React.CSSProperties = { background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }

  // WhatsApp link (usa telefono de la empresa si existe)
  const waTel = (empresa?.telefono || '').replace(/[^0-9]/g, '')
  const waMsg = encodeURIComponent(`Hola, estoy interesado en la propiedad ${propiedad.urbanizacion || ''} (${propiedad.codigo || ''}).`)

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link href="/catalogo" className="inline-flex items-center gap-1.5 text-sm font-bold mb-6 hover:underline" style={{ color: '#2563eb' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5 M12 19l-7-7 7-7" /></svg>
          Volver al catálogo
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            {imgs.length > 0 ? (
              <div>
                <div className="rounded-2xl overflow-hidden mb-3" style={{ background: '#e2e8f0', border: '1px solid #e2e8f0' }}>
                  <img src={imgs[galleryIndex]} alt={propiedad.urbanizacion} className="w-full h-[420px] object-cover" />
                </div>
                {imgs.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {imgs.map((img, i) => (
                      <button key={i} onClick={() => setGalleryIndex(i)} className="w-20 h-20 rounded-xl overflow-hidden transition-all" style={{ border: i === galleryIndex ? '2px solid #2563eb' : '2px solid #e2e8f0', opacity: i === galleryIndex ? 1 : 0.7 }}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl h-[420px] flex items-center justify-center" style={{ background: '#e2e8f0', border: '1px solid #e2e8f0' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </div>
            )}

            {/* Title + Price */}
            <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={modalidadStyle(propiedad.modalidad)}>{propiedad.modalidad}</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#eff6ff', color: '#2563eb' }}>{propiedad.tipo_propiedad}</span>
                {propiedad.codigo && <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{propiedad.codigo}</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ color: '#0f172a' }}>{propiedad.urbanizacion}</h1>
              <p className="flex items-center gap-1.5 text-sm mb-5" style={{ color: '#64748b' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {propiedad.direccion ? `${propiedad.direccion}, ` : ''}{propiedad.ciudad}{propiedad.zona ? ` - ${propiedad.zona}` : ''}
              </p>
              <div className="flex items-center gap-8 flex-wrap">
                {propiedad.precio_venta > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#94a3b8' }}>Precio Venta</p>
                    <p className="text-3xl font-black" style={{ color: '#2563eb' }}>{monedaSimbolo(propiedad.tipo_moneda)} {fmtNum(propiedad.precio_venta, 0)} <span style={{ fontSize: '0.5em', color: '#64748b', fontWeight: 600 }}>{propiedad.tipo_moneda}</span></p>
                  </div>
                )}
                {propiedad.precio_alquiler > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#94a3b8' }}>Precio Alquiler</p>
                    <p className="text-3xl font-black" style={{ color: '#2563eb' }}>{monedaSimbolo(propiedad.tipo_moneda)} {fmtNum(propiedad.precio_alquiler, 0)} <span style={{ fontSize: '0.5em', color: '#64748b', fontWeight: 600 }}>{propiedad.tipo_moneda}</span></p>
                  </div>
                )}
              </div>
            </div>

            {/* Characteristics */}
            <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
              <h2 className="text-lg font-black mb-4" style={{ color: '#0f172a' }}>Características</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Área', value: `${fmtNum(propiedad.area_m2)} m²`, show: propiedad.area_m2 > 0 },
                  { label: 'Habitaciones', value: String(propiedad.habitaciones), show: propiedad.habitaciones > 0 },
                  { label: 'Baños', value: String(propiedad.banos), show: propiedad.banos > 0 },
                  { label: 'Estacionamientos', value: String(propiedad.estacionamientos), show: propiedad.estacionamientos > 0 },
                  { label: 'Balcones', value: String(propiedad.balcones || 0), show: (propiedad.balcones || 0) > 0 },
                  { label: 'Cuarto de Ropas', value: propiedad.cuarto_ropas ? 'Sí' : 'No', show: true },
                  { label: 'Cuarto de Servicio', value: propiedad.cuarto_servicio ? 'Sí' : 'No', show: true },
                ].filter(c => c.show).map(c => (
                  <div key={c.label} className="text-center rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <p className="text-xl font-black" style={{ color: '#2563eb' }}>{c.value}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: '#64748b' }}>{c.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenidades */}
            {propiedad.amenidades && (
              <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
                <h2 className="text-lg font-black mb-3" style={{ color: '#0f172a' }}>Amenidades</h2>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{propiedad.amenidades}</p>
              </div>
            )}

            {/* Descripcion */}
            {propiedad.descripcion && (
              <div className="rounded-2xl p-6" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
                <h2 className="text-lg font-black mb-3" style={{ color: '#0f172a' }}>Descripción</h2>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{propiedad.descripcion}</p>
              </div>
            )}
          </div>

          {/* Right: Contact */}
          <div className="space-y-6">
            {/* Contacto rapido / WhatsApp */}
            {(waTel || empresa?.correo) && (
              <div className="rounded-2xl p-5 space-y-3" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
                {waTel && (
                  <a href={`https://wa.me/${waTel}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: '#16a34a' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.6-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2z" /></svg>
                    Contactar por WhatsApp
                  </a>
                )}
                {empresa?.correo && (
                  <a href={`mailto:${empresa.correo}?subject=${encodeURIComponent('Consulta propiedad ' + (propiedad.codigo || ''))}`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ background: '#ffffff', border: '1px solid #2563eb', color: '#2563eb' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" /></svg>
                    Enviar correo
                  </a>
                )}
              </div>
            )}

            {/* Asesor */}
            {asesor && (
              <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
                <p className="text-xs font-semibold mb-3" style={{ color: '#94a3b8' }}>Asesor Asignado</p>
                <div className="flex items-center gap-3">
                  {asesor.foto ? (
                    <img src={asesor.foto} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: '#2563eb' }}>
                      {asesor.nombre[0]}{asesor.apellido[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{asesor.nombre} {asesor.apellido}</p>
                    {asesor.telefono && <p className="text-xs" style={{ color: '#64748b' }}>{asesor.telefono}</p>}
                    {asesor.correo && <p className="text-xs" style={{ color: '#64748b' }}>{asesor.correo}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Form */}
            <div className="rounded-2xl p-6 sticky top-24" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
              <h2 className="text-lg font-black mb-1" style={{ color: '#0f172a' }}>¿Te interesa esta propiedad?</h2>
              <p className="text-xs mb-5" style={{ color: '#64748b' }}>Llena el formulario y un asesor te contactará</p>

              {enviado ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="font-bold mb-2" style={{ color: '#0f172a' }}>Solicitud Enviada</p>
                  <p className="text-sm mb-4" style={{ color: '#64748b' }}>Nos pondremos en contacto contigo pronto.</p>
                  <button onClick={() => setEnviado(false)} className="text-xs font-bold hover:underline" style={{ color: '#2563eb' }}>Enviar otra solicitud</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {formError && <div className="px-3 py-2 rounded-lg text-xs font-medium" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>{formError}</div>}
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Nombre *</label>
                    <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputSt} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Apellido</label>
                    <input value={apellido} onChange={e => setApellido(e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputSt} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Correo</label>
                    <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputSt} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Teléfono</label>
                    <input value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none" style={inputSt} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#475569' }}>Mensaje</label>
                    <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} rows={3} className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none" style={inputSt} placeholder="Estoy interesado en esta propiedad..." />
                  </div>
                  <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: '#2563eb' }}>
                    Solicitar Información
                  </button>
                </form>
              )}
            </div>

            {/* Datos inmobiliaria */}
            {empresa && (
              <div className="rounded-2xl p-5" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#94a3b8' }}>Inmobiliaria</p>
                <p className="font-bold text-sm mb-1" style={{ color: '#0f172a' }}>{empresa.nombre}</p>
                {empresa.telefono && <p className="text-xs" style={{ color: '#64748b' }}>Tel: {empresa.telefono}</p>}
                {empresa.correo && <p className="text-xs" style={{ color: '#64748b' }}>{empresa.correo}</p>}
                {empresa.direccion && <p className="text-xs" style={{ color: '#64748b' }}>{empresa.direccion}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
