'use client'

import { usePropiedadesStore } from '@/features/propiedades/store/propiedades-store'
import { useComercialesStore } from '@/features/comerciales/store/comerciales-store'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { useCotizacionesStore } from '@/features/cotizaciones/store/cotizaciones-store'
import { useContratosStore } from '@/features/contratos/store/contratos-store'
import { fmtNum } from '@/shared/lib/format-date'

export default function DashboardPage() {
  const propiedades = usePropiedadesStore(s => s.propiedades)
  const comerciales = useComercialesStore(s => s.comerciales)
  const clientes = useClientesStore(s => s.clientes)
  const cotizaciones = useCotizacionesStore(s => s.cotizaciones)
  const contratos = useContratosStore(s => s.contratos)

  const disponiblesVenta = propiedades.filter(p => p.estado === 'Disponible' && (p.modalidad === 'Venta' || p.modalidad === 'Venta y Alquiler'))
  const disponiblesAlquiler = propiedades.filter(p => p.estado === 'Disponible' && (p.modalidad === 'Alquiler' || p.modalidad === 'Venta y Alquiler'))
  const comercialesActivos = comerciales.filter(c => c.situacion === 'Activo')
  const prospectos = clientes.filter(c => c.tipo === 'Prospecto')

  const cards = [
    { label: 'Total Propiedades', value: propiedades.length, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: '#1d4ed8' },
    { label: 'Disponibles Venta', value: disponiblesVenta.length, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: '#10b981' },
    { label: 'Disponibles Alquiler', value: disponiblesAlquiler.length, icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z', color: '#8b5cf6' },
    { label: 'Comerciales Activos', value: comercialesActivos.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: '#f59e0b' },
    { label: 'Prospectos', value: prospectos.length, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z', color: '#06b6d4' },
    { label: 'Cotizaciones', value: cotizaciones.length, icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: '#ec4899' },
    { label: 'Contratos', value: contratos.length, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: '#3b82f6' },
  ]

  const propiedadesPorEstado = propiedades.reduce((acc, p) => {
    acc[p.estado] = (acc[p.estado] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const cotizacionesPorEstado = cotizaciones.reduce((acc, c) => {
    acc[c.situacion] = (acc[c.situacion] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const montoCotizacionesPorEstado = cotizaciones.reduce((acc, c) => {
    acc[c.situacion] = (acc[c.situacion] || 0) + (c.precio_ofertado || 0)
    return acc
  }, {} as Record<string, number>)

  const propiedadesPorCiudad = propiedades.reduce((acc, p) => {
    const ciudad = p.ciudad || 'Sin ciudad'
    acc[ciudad] = (acc[ciudad] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const propiedadesPorCiudadTipo = propiedades.reduce((acc, p) => {
    const ciudad = p.ciudad || 'Sin ciudad'
    const tipo = p.tipo_propiedad || 'Sin tipo'
    if (!acc[ciudad]) acc[ciudad] = {}
    acc[ciudad][tipo] = (acc[ciudad][tipo] || 0) + 1
    return acc
  }, {} as Record<string, Record<string, number>>)

  const montoPorCiudadTipo = propiedades.reduce((acc, p) => {
    const ciudad = p.ciudad || 'Sin ciudad'
    const tipo = p.tipo_propiedad || 'Sin tipo'
    const valor = p.precio_venta > 0 ? p.precio_venta : p.precio_alquiler
    if (!acc[ciudad]) acc[ciudad] = {}
    acc[ciudad][tipo] = (acc[ciudad][tipo] || 0) + (valor || 0)
    return acc
  }, {} as Record<string, Record<string, number>>)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.slice(0, 4).map(c => (
          <div key={c.label} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={c.icon} /></svg>
              <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            </div>
            <p className="text-2xl font-bold text-white">{fmtNum(c.value)}</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.slice(4).map(c => (
          <div key={c.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <svg className="mx-auto" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={c.icon} /></svg>
            <p className="text-xl font-bold text-white mt-2">{fmtNum(c.value)}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-lg font-semibold text-white mb-4">Propiedades por Estado</h2>
          {(() => {
            const entries = Object.entries(propiedadesPorEstado)
            const max = Math.max(...entries.map(([, v]) => v), 1)
            const estadoColors: Record<string, string> = {
              'Disponible': '#3b82f6',
              'Reservada': '#f59e0b',
              'Vendida': '#10b981',
              'Alquilada': '#a855f7',
              'Inactivo': '#ef4444',
            }
            const fallback = ['#06b6d4', '#ec4899', '#eab308', '#14b8a6', '#f97316']
            return (
              <div className="space-y-3">
                {entries.map(([estado, count], i) => {
                  const color = estadoColors[estado] || fallback[i % fallback.length]
                  const st = { color }
                  const pct = (count / max) * 100
                  return (
                    <div key={estado}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{estado}</span>
                        <span className="text-sm font-bold" style={{ color: st.color }}>{count}</span>
                      </div>
                      <div className="w-full h-6 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${pct}%`, background: st.color, minWidth: count > 0 ? '24px' : '0' }}>
                          <span className="text-xs font-bold text-white">{count}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {entries.length === 0 && <p className="text-white/30 text-sm">Sin propiedades registradas</p>}
              </div>
            )
          })()}
        </div>

        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-lg font-semibold text-white mb-4">Cotizaciones por Estado</h2>
          {(() => {
            const entries = Object.entries(cotizacionesPorEstado)
            const total = entries.reduce((sum, [, v]) => sum + v, 0)
            const cotColors: Record<string, string> = {
              'Pendiente': '#f59e0b',
              'Aceptada': '#10b981',
              'Rechazada': '#ef4444',
              'Borrador': '#6b7280',
              'Vigente': '#3b82f6',
              'Cancelado': '#dc2626',
            }
            const fallback = ['#06b6d4', '#ec4899', '#a855f7', '#14b8a6', '#f97316']

            if (total === 0) return <p className="text-white/30 text-sm">Sin cotizaciones registradas</p>

            const radius = 80
            const innerRadius = 50
            const cx = 100
            const cy = 100
            let cumulative = 0

            const slices = entries.map(([estado, count], i) => {
              const color = cotColors[estado] || fallback[i % fallback.length]
              const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2
              cumulative += count
              const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2
              const largeArc = endAngle - startAngle > Math.PI ? 1 : 0
              const x1 = cx + radius * Math.cos(startAngle)
              const y1 = cy + radius * Math.sin(startAngle)
              const x2 = cx + radius * Math.cos(endAngle)
              const y2 = cy + radius * Math.sin(endAngle)
              const xi1 = cx + innerRadius * Math.cos(startAngle)
              const yi1 = cy + innerRadius * Math.sin(startAngle)
              const xi2 = cx + innerRadius * Math.cos(endAngle)
              const yi2 = cy + innerRadius * Math.sin(endAngle)
              const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${xi1} ${yi1} Z`
              return { estado, count, color, path, pct: ((count / total) * 100).toFixed(1) }
            })

            const isSingle = slices.length === 1

            return (
              <div className="flex items-center gap-6 flex-wrap">
                <svg width="200" height="200" viewBox="0 0 200 200" className="shrink-0">
                  {isSingle ? (
                    <>
                      <circle cx={cx} cy={cy} r={radius} fill={slices[0].color} />
                      <circle cx={cx} cy={cy} r={innerRadius} fill="rgba(15,23,42,1)" />
                    </>
                  ) : (
                    slices.map(s => (
                      <path key={s.estado} d={s.path} fill={s.color} stroke="rgba(15,23,42,0.5)" strokeWidth="1" />
                    ))
                  )}
                  <text x="100" y="95" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="bold">{total}</text>
                  <text x="100" y="115" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11">Total</text>
                </svg>
                <div className="flex-1 space-y-2 min-w-[220px]">
                  {slices.map(s => {
                    const monto = montoCotizacionesPorEstado[s.estado] || 0
                    return (
                      <div key={s.estado} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
                        <span className="text-sm text-white flex-1">{s.estado}</span>
                        <span className="text-sm font-bold text-white">{s.count}</span>
                        <span className="text-xs font-semibold" style={{ color: s.color }}>$ {fmtNum(monto, 2)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Propiedades por Ciudad y Tipo - Stacked Vertical Bars */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 className="text-lg font-semibold text-white mb-4">Propiedades por Ciudad y Tipo</h2>
        {(() => {
          const ciudades = Object.keys(propiedadesPorCiudadTipo).sort((a, b) => (propiedadesPorCiudad[b] || 0) - (propiedadesPorCiudad[a] || 0))
          if (ciudades.length === 0) return <p className="text-white/30 text-sm">Sin propiedades registradas</p>
          const tipos = Array.from(new Set(propiedades.map(p => p.tipo_propiedad || 'Sin tipo')))
          const tipoColors: Record<string, string> = {
            'Casa': '#3b82f6',
            'Apartamento': '#f97316',
            'Townhouse': '#a855f7',
            'Local Comercial': '#f59e0b',
            'Oficina': '#06b6d4',
            'Terreno': '#ec4899',
          }
          const fallback = ['#eab308', '#14b8a6', '#f97316', '#ef4444']
          const max = Math.max(...ciudades.map(c => propiedadesPorCiudad[c] || 0))
          const chartHeight = 240
          return (
            <>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {tipos.map((tipo, i) => (
                  <div key={tipo} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: tipoColors[tipo] || fallback[i % fallback.length] }} />
                    <span className="text-xs text-white/70">{tipo}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-around gap-4 overflow-x-auto pb-4" style={{ minHeight: `${chartHeight + 60}px` }}>
                {ciudades.map(ciudad => {
                  const total = propiedadesPorCiudad[ciudad] || 0
                  const tiposEnCiudad = propiedadesPorCiudadTipo[ciudad] || {}
                  const montosEnCiudad = montoPorCiudadTipo[ciudad] || {}
                  const totalHeight = (total / max) * chartHeight
                  return (
                    <div key={ciudad} className="flex flex-col items-center gap-2 min-w-[160px]">
                      <span className="text-sm font-bold text-white">{total}</span>
                      <div className="w-16 rounded-lg overflow-hidden flex flex-col-reverse" style={{ height: `${totalHeight}px`, minHeight: total > 0 ? '12px' : '0' }}>
                        {tipos.map((tipo, i) => {
                          const count = tiposEnCiudad[tipo] || 0
                          if (count === 0) return null
                          const segHeight = (count / total) * 100
                          const color = tipoColors[tipo] || fallback[i % fallback.length]
                          return (
                            <div key={tipo} className="w-full flex items-center justify-center transition-all duration-500" style={{ height: `${segHeight}%`, background: color }}>
                              {segHeight > 15 && <span className="text-xs font-bold text-white">{count}</span>}
                            </div>
                          )
                        })}
                      </div>
                      <span className="text-xs text-center text-white/70 mt-1 whitespace-nowrap font-semibold">{ciudad}</span>
                      <div className="flex flex-col gap-0.5 w-full">
                        {tipos.map((tipo, i) => {
                          const count = tiposEnCiudad[tipo] || 0
                          if (count === 0) return null
                          const monto = montosEnCiudad[tipo] || 0
                          const color = tipoColors[tipo] || fallback[i % fallback.length]
                          return (
                            <div key={tipo} className="flex items-center justify-between gap-2 text-[10px]">
                              <div className="flex items-center gap-1 min-w-0">
                                <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: color }} />
                                <span className="text-white/60 truncate">{tipo}</span>
                              </div>
                              <span className="font-bold whitespace-nowrap" style={{ color }}>$ {fmtNum(monto, 0)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )
        })()}
      </div>

      {/* Propiedades por Ciudad - Vertical Bars */}
      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 className="text-lg font-semibold text-white mb-4">Propiedades por Ciudad</h2>
        {(() => {
          const entries = Object.entries(propiedadesPorCiudad).sort((a, b) => b[1] - a[1])
          if (entries.length === 0) return <p className="text-white/30 text-sm">Sin propiedades registradas</p>
          const max = Math.max(...entries.map(([, v]) => v))
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#eab308', '#14b8a6', '#f97316', '#ef4444']
          const chartHeight = 220
          return (
            <div className="flex items-end justify-around gap-4 overflow-x-auto pb-4" style={{ minHeight: `${chartHeight + 60}px` }}>
              {entries.map(([ciudad, count], i) => {
                const color = colors[i % colors.length]
                const barHeight = (count / max) * chartHeight
                return (
                  <div key={ciudad} className="flex flex-col items-center gap-2 min-w-[70px]">
                    <span className="text-sm font-bold" style={{ color }}>{count}</span>
                    <div className="w-14 rounded-t-lg transition-all duration-500 flex items-start justify-center pt-2" style={{ height: `${barHeight}px`, background: color, minHeight: count > 0 ? '8px' : '0' }} />
                    <span className="text-xs text-center text-white/70 mt-1 whitespace-nowrap">{ciudad}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
