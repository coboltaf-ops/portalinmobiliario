'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { usePropiedadesStore, type Propiedad } from '@/features/propiedades/store/propiedades-store'
import { useConfigStore, getZonasByCiudad, getAllZonas } from '@/features/configuracion/store/configuracion-store'
import { fmtNum } from '@/shared/lib/format-date'

const modalidadStyle = (m: string): React.CSSProperties => {
  if (m === 'Venta') return { background: '#dcfce7', color: '#16a34a' }
  if (m === 'Alquiler') return { background: '#dbeafe', color: '#2563eb' }
  if (m === 'Venta y Alquiler') return { background: '#ede9fe', color: '#7c3aed' }
  return { background: '#f1f5f9', color: '#475569' }
}

const CAT_COLORS: Record<string, string> = {
  Casa: '#2563eb', Apartamento: '#8b5cf6', Local: '#f59e0b',
  Oficina: '#06b6d4', Lote: '#10b981', Bodega: '#ef4444',
}
const catColor = (tipo: string) => CAT_COLORS[tipo] || '#64748b'

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
          {monedaSimbolo(p.tipo_moneda)} {fmtNum(precio, 0)} <span style={{ fontSize: '0.65em', color: '#64748b', fontWeight: 600 }}>{p.tipo_moneda}</span>
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

function CatalogoContent() {
  const searchParams = useSearchParams()
  const propiedades = usePropiedadesStore(s => s.propiedades)
  const config = useConfigStore()
  const disponibles = propiedades.filter(p => p.estado === 'Disponible')

  const [search, setSearch] = useState('')
  const [filtroTipo, setFiltroTipo] = useState(searchParams.get('tipo') || '')
  const [filtroCiudad, setFiltroCiudad] = useState(searchParams.get('ciudad') || '')
  const [filtroZona, setFiltroZona] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState(searchParams.get('modalidad') || '')

  const monedaSimbolo = (code: string) => {
    const m = config.monedas.find(m => m.nombre === code)
    return m ? m.simbolo : '$'
  }

  const filtered = disponibles.filter(p => {
    const matchSearch = !search ||
      p.urbanizacion.toLowerCase().includes(search.toLowerCase()) ||
      p.direccion.toLowerCase().includes(search.toLowerCase()) ||
      p.ciudad.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase())
    const matchTipo = !filtroTipo || p.tipo_propiedad === filtroTipo
    const matchCiudad = !filtroCiudad || p.ciudad === filtroCiudad
    const matchZona = !filtroZona || p.zona === filtroZona
    const matchModalidad = !filtroModalidad || p.modalidad === filtroModalidad
    return matchSearch && matchTipo && matchCiudad && matchZona && matchModalidad
  })

  const hayFiltros = search || filtroTipo || filtroCiudad || filtroZona || filtroModalidad
  const selectSt: React.CSSProperties = { background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-black mb-1" style={{ color: '#0f172a' }}>Propiedades Disponibles</h1>
        <p className="text-sm mb-8" style={{ color: '#64748b' }}>
          {filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Filtros */}
        <div className="rounded-2xl p-5 mb-8" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(2,6,23,0.06)' }}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, dirección..."
              className="rounded-xl px-4 py-2.5 text-sm outline-none"
              style={selectSt}
            />
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="rounded-xl px-3 py-2.5 text-sm outline-none" style={selectSt}>
              <option value="">Todos los tipos</option>
              {config.tiposPropiedad.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
            </select>
            <select value={filtroCiudad} onChange={e => { setFiltroCiudad(e.target.value); setFiltroZona('') }} className="rounded-xl px-3 py-2.5 text-sm outline-none" style={selectSt}>
              <option value="">Todas las ciudades/poblaciones</option>
              {config.ciudades.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            </select>
            <select value={filtroZona} onChange={e => setFiltroZona(e.target.value)} className="rounded-xl px-3 py-2.5 text-sm outline-none" style={selectSt}>
              <option value="">Todas las zonas</option>
              {(filtroCiudad ? getZonasByCiudad(config.ciudades, filtroCiudad) : getAllZonas(config.ciudades)).map(z => <option key={z.id} value={z.nombre}>{z.nombre}</option>)}
            </select>
            <select value={filtroModalidad} onChange={e => setFiltroModalidad(e.target.value)} className="rounded-xl px-3 py-2.5 text-sm outline-none" style={selectSt}>
              <option value="">Todas las modalidades</option>
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Venta y Alquiler">Venta y Alquiler</option>
            </select>
          </div>
          {hayFiltros && (
            <button onClick={() => { setSearch(''); setFiltroTipo(''); setFiltroCiudad(''); setFiltroZona(''); setFiltroModalidad('') }} className="mt-3 text-xs font-bold hover:underline" style={{ color: '#2563eb' }}>
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => <PropertyCard key={p.id} p={p} monedaSimbolo={monedaSimbolo} />)}
          </div>
        ) : (
          <div className="rounded-2xl py-20 text-center" style={{ background: '#ffffff', border: '1px dashed #cbd5e1' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#eff6ff' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            </div>
            <p className="font-bold text-lg" style={{ color: '#0f172a' }}>No se encontraron propiedades</p>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Prueba ajustando o limpiando los filtros de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-20 text-center" style={{ color: '#64748b' }}>Cargando propiedades...</div>}>
      <CatalogoContent />
    </Suspense>
  )
}
