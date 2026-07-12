'use client'

import Link from 'next/link'
import { usePropiedadesStore } from '@/features/propiedades/store/propiedades-store'
import { useConfigStore } from '@/features/configuracion/store/configuracion-store'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'
import { fmtNum } from '@/shared/lib/format-date'

export default function InicioPage() {
  const propiedades = usePropiedadesStore(s => s.propiedades)
  const config = useConfigStore()
  const empresa = useEmpresaStore(s => s.empresa)

  const disponibles = propiedades.filter(p => p.estado === 'Disponible')
  const destacadas = disponibles.slice(0, 6)

  const monedaSimbolo = (code: string) => {
    const m = config.monedas.find(m => m.nombre === code)
    return m ? m.simbolo : '$'
  }

  return (
    <div>
      {/* Header with Logo and Title */}
      <div className="flex items-center gap-4 px-6 py-4 md:px-8" style={{ background: '#001e4d' }}>
        <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#2563eb' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">PORTAL INMOBILIARIO</h1>
      </div>

      {/* Hero */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-20 w-96 h-96 rounded-full blur-[128px] opacity-20" style={{ background: '#3b82f6' }} />
          <div className="absolute bottom-10 right-20 w-80 h-80 rounded-full blur-[128px] opacity-15" style={{ background: '#1d4ed8' }} />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Encuentra tu <span style={{ color: '#3b82f6' }}>Propiedad Ideal</span>
          </h1>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Explora nuestra seleccion de propiedades disponibles. Casas, apartamentos, locales y mas.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/catalogo" className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.9), rgba(59,130,246,0.7))', border: '1px solid rgba(30,64,175,0.5)', boxShadow: '0 0 30px rgba(30,64,175,0.3)' }}>
              Ver Propiedades
            </Link>
          </div>
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Propiedades', value: disponibles.length },
              { label: 'Ciudades', value: [...new Set(disponibles.map(p => p.ciudad).filter(Boolean))].length },
              { label: 'Tipos', value: [...new Set(disponibles.map(p => p.tipo_propiedad).filter(Boolean))].length },
              { label: 'Zonas', value: [...new Set(disponibles.map(p => p.zona).filter(Boolean))].length },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {destacadas.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Propiedades Destacadas</h2>
              <Link href="/catalogo" className="text-sm font-medium hover:underline" style={{ color: '#3b82f6' }}>Ver todas →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destacadas.map(p => (
                <Link key={p.id} href={`/propiedad/${p.id}`} className="group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="h-48 overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    {p.imagenes && p.imagenes.length > 0 ? (
                      <img src={p.imagenes[0]} alt={p.urbanizacion} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
                          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: 'rgba(30,64,175,0.2)', color: '#60a5fa' }}>{p.tipo_propiedad}</span>
                      <span className="text-xs text-white/50">{p.modalidad}</span>
                    </div>
                    <h3 className="text-white font-bold mb-1">{p.urbanizacion}</h3>
                    <p className="text-xs font-semibold mb-3" style={{ color: '#eab308' }}>{p.direccion ? `${p.direccion}, ` : ''}{p.ciudad}{p.zona ? ` - ${p.zona}` : ''}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-black" style={{ color: '#3b82f6' }}>
                        {monedaSimbolo(p.tipo_moneda)} {p.precio_venta > 0 ? fmtNum(p.precio_venta, 2) : fmtNum(p.precio_alquiler, 2)}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-semibold" style={{ color: '#ffffff' }}>
                        {p.habitaciones > 0 && <span>{p.habitaciones} Hab</span>}
                        {p.banos > 0 && <span>{p.banos} Ba</span>}
                        {p.area_m2 > 0 && <span>{fmtNum(p.area_m2)} m²</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-2xl p-12" style={{ background: 'rgba(30,64,175,0.15)', border: '1px solid rgba(30,64,175,0.2)' }}>
          <h2 className="text-3xl font-bold text-white mb-4">¿Buscas algo especifico?</h2>
          <p className="text-white/60 mb-8">Explora nuestro catalogo completo y encuentra la propiedad que se ajuste a tus necesidades.</p>
          <Link href="/catalogo" className="px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 inline-block" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.9), rgba(59,130,246,0.7))', border: '1px solid rgba(30,64,175,0.5)' }}>
            Explorar Catalogo
          </Link>
        </div>
      </section>
    </div>
  )
}
