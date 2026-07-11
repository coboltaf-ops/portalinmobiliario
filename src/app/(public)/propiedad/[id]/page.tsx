'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePropiedadesStore } from '@/features/propiedades/store/propiedades-store'
import { useComercialesStore } from '@/features/comerciales/store/comerciales-store'
import { useConfigStore } from '@/features/configuracion/store/configuracion-store'
import { useSolicitudesStore } from '@/features/solicitudes/store/solicitudes-store'
import { supabase } from '@/shared/lib/supabase'
import { fmtNum } from '@/shared/lib/format-date'

export default function PropiedadDetallePage() {
  const params = useParams()
  const router = useRouter()
  const propiedades = usePropiedadesStore(s => s.propiedades)
  const comerciales = useComercialesStore(s => s.comerciales)
  const config = useConfigStore()
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
    const { data } = await supabase.from('solicitudes').select('codigo').order('codigo', { ascending: false }).limit(1)
    const maxCode = data && data.length > 0 ? data[0].codigo : 'SOL-00000'
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
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-white/50 text-lg mb-4">Propiedad no encontrada</p>
        <Link href="/catalogo" className="text-sm font-medium hover:underline" style={{ color: '#3b82f6' }}>← Volver al catalogo</Link>
      </div>
    )
  }

  const asesor = comerciales.find(c => c.id === propiedad.asesor_asignado)
  const imgs = propiedad.imagenes || []
  const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link href="/catalogo" className="text-sm font-medium hover:underline mb-6 inline-block" style={{ color: '#60a5fa' }}>← Volver al catalogo</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          {imgs.length > 0 && (
            <div>
              <div className="rounded-2xl overflow-hidden mb-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <img src={imgs[galleryIndex]} alt={propiedad.urbanizacion} className="w-full h-96 object-cover" />
              </div>
              {imgs.length > 1 && (
                <div className="flex gap-2">
                  {imgs.map((img, i) => (
                    <button key={i} onClick={() => setGalleryIndex(i)} className="w-20 h-20 rounded-lg overflow-hidden transition-all" style={{ border: i === galleryIndex ? '2px solid #3b82f6' : '2px solid transparent', opacity: i === galleryIndex ? 1 : 0.6 }}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title + Price */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(30,64,175,0.2)', color: '#60a5fa' }}>{propiedad.tipo_propiedad}</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>{propiedad.modalidad}</span>
              <span className="text-xs text-white/40">{propiedad.codigo}</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">{propiedad.urbanizacion}</h1>
            <p className="text-white/50 text-sm mb-4">{propiedad.direccion ? `${propiedad.direccion}, ` : ''}{propiedad.ciudad}{propiedad.zona ? ` - ${propiedad.zona}` : ''}</p>
            <div className="flex items-center gap-6">
              {propiedad.precio_venta > 0 && (
                <div>
                  <p className="text-xs text-white/40">Precio Venta</p>
                  <p className="text-2xl font-black" style={{ color: '#3b82f6' }}>{monedaSimbolo(propiedad.tipo_moneda)} {fmtNum(propiedad.precio_venta, 2)}</p>
                </div>
              )}
              {propiedad.precio_alquiler > 0 && (
                <div>
                  <p className="text-xs text-white/40">Precio Alquiler</p>
                  <p className="text-2xl font-black" style={{ color: '#3b82f6' }}>{monedaSimbolo(propiedad.tipo_moneda)} {fmtNum(propiedad.precio_alquiler, 2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Characteristics */}
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-lg font-bold text-white mb-4">Caracteristicas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Area', value: `${fmtNum(propiedad.area_m2)} m²`, show: propiedad.area_m2 > 0 },
                { label: 'Habitaciones', value: String(propiedad.habitaciones), show: propiedad.habitaciones > 0 },
                { label: 'Banos', value: String(propiedad.banos), show: propiedad.banos > 0 },
                { label: 'Estacionamientos', value: String(propiedad.estacionamientos), show: propiedad.estacionamientos > 0 },
                { label: 'Balcones', value: String(propiedad.balcones || 0), show: (propiedad.balcones || 0) > 0 },
                { label: 'Cuarto de Ropas', value: propiedad.cuarto_ropas ? 'Si' : 'No', show: true },
                { label: 'Cuarto de Servicio', value: propiedad.cuarto_servicio ? 'Si' : 'No', show: true },
              ].filter(c => c.show).map(c => (
                <div key={c.label} className="text-center rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-lg font-black" style={{ color: '#ffffff' }}>{c.value}</p>
                  <p className="text-xs font-semibold" style={{ color: '#ffffff' }}>{c.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Amenidades */}
          {propiedad.amenidades && (
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-lg font-bold text-white mb-3">Amenidades</h2>
              <p className="text-sm text-white/70">{propiedad.amenidades}</p>
            </div>
          )}

          {/* Descripcion */}
          {propiedad.descripcion && (
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-lg font-bold text-white mb-3">Descripcion</h2>
              <p className="text-sm text-white/70">{propiedad.descripcion}</p>
            </div>
          )}
        </div>

        {/* Right: Contact Form */}
        <div className="space-y-6">
          {/* Asesor */}
          {asesor && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-white/40 mb-2">Asesor Asignado</p>
              <div className="flex items-center gap-3">
                {asesor.foto ? (
                  <img src={asesor.foto} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'rgba(30,64,175,0.3)' }}>
                    {asesor.nombre[0]}{asesor.apellido[0]}
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-sm">{asesor.nombre} {asesor.apellido}</p>
                  {asesor.telefono && <p className="text-white/50 text-xs">{asesor.telefono}</p>}
                  {asesor.correo && <p className="text-white/50 text-xs">{asesor.correo}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Contact Form */}
          <div className="rounded-2xl p-6 sticky top-24" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-lg font-bold text-white mb-1">¿Te interesa esta propiedad?</h2>
            <p className="text-xs text-white/50 mb-5">Llena el formulario y un asesor te contactara</p>

            {enviado ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-white font-semibold mb-2">Solicitud Enviada</p>
                <p className="text-white/50 text-sm mb-4">Nos pondremos en contacto contigo pronto.</p>
                <button onClick={() => setEnviado(false)} className="text-xs font-medium hover:underline" style={{ color: '#60a5fa' }}>Enviar otra solicitud</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {formError && <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>{formError}</div>}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Nombre *</label>
                  <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Apellido</label>
                  <input value={apellido} onChange={e => setApellido(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Correo</label>
                  <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Telefono</label>
                  <input value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Mensaje</label>
                  <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={inputSt} placeholder="Estoy interesado en esta propiedad..." />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.9), rgba(59,130,246,0.7))', border: '1px solid rgba(30,64,175,0.5)', boxShadow: '0 0 20px rgba(30,64,175,0.2)' }}>
                  Solicitar Informacion
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
