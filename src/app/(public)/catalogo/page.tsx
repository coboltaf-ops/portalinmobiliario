'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePropiedadesStore } from '@/features/propiedades/store/propiedades-store'
import { useConfigStore, getZonasByCiudad, getAllZonas } from '@/features/configuracion/store/configuracion-store'
import { fmtNum } from '@/shared/lib/format-date'

export default function CatalogoPage() {
  const propiedades = usePropiedadesStore(s => s.propiedades)
  const config = useConfigStore()
  const disponibles = propiedades.filter(p => p.estado === 'Disponible')

  const [search, setSearch] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroCiudad, setFiltroCiudad] = useState('')
  const [filtroZona, setFiltroZona] = useState('')
  const [filtroModalidad, setFiltroModalidad] = useState('')

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

  const selectSt: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">Propiedades Disponibles</h1>

      {/* Filters */}
      <div className="rounded-2xl p-5 mb-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, direccion..."
            className="rounded-lg px-4 py-2.5 text-sm outline-none"
            style={selectSt}
          />
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="rounded-lg px-3 py-2.5 text-sm outline-none" style={selectSt}>
            <option value="">Todos los tipos</option>
            {config.tiposPropiedad.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
          </select>
          <select value={filtroCiudad} onChange={e => { setFiltroCiudad(e.target.value); setFiltroZona('') }} className="rounded-lg px-3 py-2.5 text-sm outline-none" style={selectSt}>
            <option value="">Todas las ciudades/poblaciones</option>
            {config.ciudades.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
          </select>
          <select value={filtroZona} onChange={e => setFiltroZona(e.target.value)} className="rounded-lg px-3 py-2.5 text-sm outline-none" style={selectSt}>
            <option value="">Todas las zonas</option>
            {(filtroCiudad ? getZonasByCiudad(config.ciudades, filtroCiudad) : getAllZonas(config.ciudades)).map(z => <option key={z.id} value={z.nombre}>{z.nombre}</option>)}
          </select>
          <select value={filtroModalidad} onChange={e => setFiltroModalidad(e.target.value)} className="rounded-lg px-3 py-2.5 text-sm outline-none" style={selectSt}>
            <option value="">Todas las modalidades</option>
            <option value="Venta">Venta</option>
            <option value="Alquiler">Alquiler</option>
            <option value="Venta y Alquiler">Venta y Alquiler</option>
          </select>
        </div>
        {(search || filtroTipo || filtroCiudad || filtroZona || filtroModalidad) && (
          <button onClick={() => { setSearch(''); setFiltroTipo(''); setFiltroCiudad(''); setFiltroZona(''); setFiltroModalidad('') }} className="mt-3 text-xs font-medium hover:underline" style={{ color: '#60a5fa' }}>
            Limpiar filtros
          </button>
        )}
      </div>

      <p className="text-white/40 text-sm mb-6">{filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <Link key={p.id} href={`/propiedad/${p.id}`} className="group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="h-52 overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
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
                <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(153,27,27,0.3)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.4)' }}>{p.modalidad}</span>
              </div>
              <h3 className="text-white font-bold mb-1 text-lg">{p.urbanizacion}</h3>
              <p className="text-xs font-semibold mb-3" style={{ color: '#eab308' }}>{p.direccion ? `${p.direccion}, ` : ''}{p.ciudad}{p.zona ? ` - ${p.zona}` : ''}</p>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xl font-black" style={{ color: '#3b82f6' }}>
                  {monedaSimbolo(p.tipo_moneda)} {p.precio_venta > 0 ? fmtNum(p.precio_venta, 2) : fmtNum(p.precio_alquiler, 2)}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', color: '#ffffff' }}>
                {p.habitaciones > 0 && <span>{p.habitaciones} Hab.</span>}
                {p.banos > 0 && <span>{p.banos} Baños</span>}
                {p.area_m2 > 0 && <span>{fmtNum(p.area_m2)} m²</span>}
              </div>
              <div className="flex items-center gap-4 text-xs mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <span>📍 {p.ciudad || 'Sin ciudad/poblacion'}</span>
                <span>🗺️ {p.zona || 'Sin zona'}</span>
                <span>🅿️ {p.estacionamientos} Estac.</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/30 text-lg">No se encontraron propiedades con los filtros seleccionados</p>
        </div>
      )}
    </div>
  )
}
