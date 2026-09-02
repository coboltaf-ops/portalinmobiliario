'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePropiedadesStore, type Propiedad } from '@/features/propiedades/store/propiedades-store'
import { useConfigStore } from '@/features/configuracion/store/configuracion-store'
import { fmtNum } from '@/shared/lib/format-date'

// --- Paleta modalidad ---
const modalidadStyle = (m: string): React.CSSProperties => {
  if (m === 'Venta') return { background: '#dcfce7', color: '#16a34a' }
  if (m === 'Alquiler') return { background: '#dbeafe', color: '#2563eb' }
  if (m === 'Venta y Alquiler') return { background: '#ede9fe', color: '#7c3aed' }
  return { background: '#f1f5f9', color: '#475569' }
}

// --- Colores de categorias ---
const CATEGORIAS: { nombre: string; color: string; icon: React.ReactNode }[] = [
  { nombre: 'Casa', color: '#2563eb', icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" /> },
  { nombre: 'Apartamento', color: '#8b5cf6', icon: <><rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 22v-4h6v4 M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01" /></> },
  { nombre: 'Local', color: '#f59e0b', icon: <path d="M3 9l1-5h16l1 5 M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9 M3 9h18 M9 21v-6h6v6" /> },
  { nombre: 'Oficina', color: '#06b6d4', icon: <><rect x="3" y="3" width="18" height="18" rx="1" /><path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M10 21v-4h4v4" /></> },
  { nombre: 'Lote', color: '#10b981', icon: <path d="M3 20h18 M5 20V9l7-5 7 5v11 M9 20v-6h6v6" /> },
  { nombre: 'Bodega', color: '#ef4444', icon: <path d="M3 21V8l9-4 9 4v13 M3 21h18 M7 21v-8h10v8 M7 13h10" /> },
]

const catColor = (tipo: string) =>
  CATEGORIAS.find(c => c.nombre === tipo)?.color || '#64748b'

// --- Property Card ---
function PropertyCard({ p, monedaSimbolo }: { p: Propiedad; monedaSimbolo: (c: string) => string }) {
  const precio = p.precio_venta > 0 ? p.precio_venta : p.precio_alquiler
  return (
    <Link
      href={`/propiedad/${p.id}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}
    >
      <div className="relative h-[200px] overflow-hidden" style={{ background: '#e2e8f0' }}>
        {p.imagenes && p.imagenes.length > 0 ? (
          <img src={p.imagenes[0]} alt={p.urbanizacion} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}
        <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full" style={modalidadStyle(p.modalidad)}>{p.modalidad}</span>
        {p.tipo_propiedad && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.92)', color: catColor(p.tipo_propiedad) }}>{p.tipo_propiedad}</span>
        )}
      </div>
      <div className="p-5">
        <p className="text-2xl font-extrabold mb-1" style={{ color: '#2563eb' }}>
          {monedaSimbolo(p.tipo_moneda)} {fmtNum(precio, 2)}
        </p>
        <h3 className="font-bold text-base mb-1 truncate" style={{ color: '#0f172a' }}>{p.urbanizacion || 'Propiedad'}</h3>
        <p className="flex items-center gap-1 text-sm mb-4" style={{ color: '#94a3b8' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span className="truncate">{p.direccion ? `${p.direccion}, ` : ''}{p.ciudad}{p.zona ? ` - ${p.zona}` : ''}</span>
        </p>
        <div className="flex items-center gap-4 pt-3 text-sm font-semibold" style={{ borderTop: '1px solid #f1f5f9', color: '#475569' }}>
          {p.habitaciones > 0 && (
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16 M2 8h18a2 2 0 0 1 2 2v10 M2 17h20 M6 8v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              {p.habitaciones} Hab
            </span>
          )}
          {p.banos > 0 && (
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3a1 1 0 0 1 1-1z M6 12V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2" /></svg>
              {p.banos} Baños
            </span>
          )}
          {p.area_m2 > 0 && (
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z M9 3v18 M15 3v18 M3 9h18 M3 15h18" /></svg>
              {fmtNum(p.area_m2)} m²
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function InicioPage() {
  const router = useRouter()
  const propiedades = usePropiedadesStore(s => s.propiedades)
  const config = useConfigStore()

  const disponibles = propiedades.filter(p => p.estado === 'Disponible')
  const destacadas = disponibles.slice(0, 6)

  const tiposUnicos = [...new Set(disponibles.map(p => p.tipo_propiedad).filter(Boolean))]
  const ciudadesUnicas = [...new Set(disponibles.map(p => p.ciudad).filter(Boolean))]

  const [bTipo, setBTipo] = useState('')
  const [bCiudad, setBCiudad] = useState('')
  const [bModalidad, setBModalidad] = useState('')

  const monedaSimbolo = (code: string) => {
    const m = config.monedas.find(m => m.nombre === code)
    return m ? m.simbolo : '$'
  }

  const buscar = () => {
    const params = new URLSearchParams()
    if (bTipo) params.set('tipo', bTipo)
    if (bCiudad) params.set('ciudad', bCiudad)
    if (bModalidad) params.set('modalidad', bModalidad)
    const q = params.toString()
    router.push(q ? `/catalogo?${q}` : '/catalogo')
  }

  const stats = [
    { label: 'Propiedades', value: disponibles.length, color: '#2563eb' },
    { label: 'Ciudades', value: ciudadesUnicas.length, color: '#8b5cf6' },
    { label: 'Tipos', value: tiposUnicos.length, color: '#f59e0b' },
    { label: 'Zonas', value: [...new Set(disponibles.map(p => p.zona).filter(Boolean))].length, color: '#10b981' },
  ]

  const selectSt: React.CSSProperties = { background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }

  const beneficios = [
    { titulo: 'Asesoría personalizada', texto: 'Te acompañamos en cada paso para encontrar la propiedad perfecta.', color: '#2563eb', icon: <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" /> },
    { titulo: 'Propiedades verificadas', texto: 'Cada inmueble es revisado para garantizar información confiable.', color: '#16a34a', icon: <path d="M9 12l2 2 4-4 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /> },
    { titulo: 'Proceso ágil', texto: 'Encuentra y contacta por tu propiedad ideal en minutos.', color: '#f59e0b', icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /> },
    { titulo: 'Acompañamiento legal', texto: 'Respaldo profesional en toda la gestión de tu inmueble.', color: '#8b5cf6', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
  ]

  return (
    <div>
      {/* HERO */}
      <section className="relative px-6 py-20 md:py-28 overflow-hidden" style={{ background: 'linear-gradient(160deg, #eff6ff 0%, #f1f5f9 55%, #eef2ff 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: '#bfdbfe' }} />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-40" style={{ background: '#ddd6fe' }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight" style={{ color: '#0f172a' }}>
            Encuentra tu <span style={{ color: '#2563eb' }}>Propiedad Ideal</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#475569' }}>
            Explora nuestra selección de propiedades disponibles. Casas, apartamentos, locales y mucho más.
          </p>

          {/* Barra de busqueda */}
          <div className="rounded-2xl p-4 md:p-5 text-left" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(2,6,23,0.10)' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Tipo de propiedad</label>
                <select value={bTipo} onChange={e => setBTipo(e.target.value)} className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={selectSt}>
                  <option value="">Todos</option>
                  {tiposUnicos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Ciudad</label>
                <select value={bCiudad} onChange={e => setBCiudad(e.target.value)} className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={selectSt}>
                  <option value="">Todas</option>
                  {ciudadesUnicas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Modalidad</label>
                <select value={bModalidad} onChange={e => setBModalidad(e.target.value)} className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={selectSt}>
                  <option value="">Todas</option>
                  <option value="Venta">Venta</option>
                  <option value="Alquiler">Alquiler</option>
                  <option value="Venta y Alquiler">Venta y Alquiler</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={buscar} className="w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: '#2563eb' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 -mt-10 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl p-5 text-center" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-sm font-medium mt-1" style={{ color: '#64748b' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-2" style={{ color: '#0f172a' }}>Explora por categoría</h2>
          <p className="text-center mb-10" style={{ color: '#64748b' }}>Encuentra el tipo de propiedad que buscas</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIAS.map(cat => (
              <Link
                key={cat.nombre}
                href={`/catalogo?tipo=${encodeURIComponent(cat.nombre)}`}
                className="group flex flex-col items-center text-center rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ background: `${cat.color}1a` }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{cat.icon}</svg>
                </div>
                <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{cat.nombre}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DESTACADAS */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: '#0f172a' }}>Propiedades Destacadas</h2>
            <Link href="/catalogo" className="text-sm font-bold hover:underline" style={{ color: '#2563eb' }}>Ver todas →</Link>
          </div>
          {destacadas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destacadas.map(p => <PropertyCard key={p.id} p={p} monedaSimbolo={monedaSimbolo} />)}
            </div>
          ) : (
            <div className="rounded-2xl py-20 text-center" style={{ background: '#ffffff', border: '1px dashed #cbd5e1' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#eff6ff' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              </div>
              <p className="font-bold text-lg" style={{ color: '#0f172a' }}>Pronto publicaremos propiedades</p>
              <p className="text-sm mt-1" style={{ color: '#64748b' }}>Vuelve muy pronto para descubrir nuevas oportunidades.</p>
            </div>
          )}
        </div>
      </section>

      {/* POR QUE ELEGIRNOS */}
      <section className="px-6 py-16" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-2" style={{ color: '#0f172a' }}>¿Por qué elegirnos?</h2>
          <p className="text-center mb-12" style={{ color: '#64748b' }}>Hacemos que encontrar tu propiedad sea una experiencia sencilla y segura</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beneficios.map(b => (
              <div key={b.titulo} className="text-center px-4">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${b.color}1a` }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={b.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{b.icon}</svg>
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#0f172a' }}>{b.titulo}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{b.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center rounded-3xl px-8 py-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4">¿Buscas algo específico?</h2>
          <p className="text-base md:text-lg mb-8 max-w-xl mx-auto" style={{ color: '#bfdbfe' }}>Explora nuestro catálogo completo y encuentra la propiedad que se ajuste a tus necesidades.</p>
          <Link href="/catalogo" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-105" style={{ background: '#f59e0b', color: '#0f172a' }}>
            Explorar Catálogo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14 M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
