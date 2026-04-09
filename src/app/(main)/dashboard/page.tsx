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

  const statusColor = (s: string) => {
    switch (s) {
      case 'Disponible': case 'Activo': return { bg: 'rgba(29,78,216,0.2)', color: '#3b82f6', border: '1px solid rgba(29,78,216,0.3)' }
      case 'Vendida': case 'Aceptada': case 'Vigente': return { bg: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
      case 'Reservada': case 'Pendiente': case 'Borrador': return { bg: 'rgba(245,158,11,0.2)', color: '#60a5fa', border: '1px solid rgba(245,158,11,0.3)' }
      case 'Alquilada': return { bg: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }
      case 'Cancelado': case 'Rechazada': case 'Inactivo': return { bg: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
      default: return { bg: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }
    }
  }

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
            return (
              <div className="space-y-3">
                {entries.map(([estado, count]) => {
                  const st = statusColor(estado)
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
          <div className="flex flex-wrap gap-4">
            {Object.entries(cotizacionesPorEstado).map(([estado, count]) => {
              const st = statusColor(estado)
              return (
                <div key={estado} className="rounded-xl px-5 py-3" style={{ background: st.bg, border: st.border }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold" style={{ color: st.color }}>{count}</span>
                    <span className="text-sm font-medium" style={{ color: st.color }}>{estado}</span>
                  </div>
                </div>
              )
            })}
            {Object.keys(cotizacionesPorEstado).length === 0 && <p className="text-white/30 text-sm">Sin cotizaciones registradas</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
