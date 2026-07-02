'use client'

import { useEffect, useState } from 'react'
import { useModulosStore, type Modulo } from '@/features/configuracion/store/modulos-store'

export const dynamic = 'force-dynamic'

export default function ModulosPage() {
  const { modulos, loading, fetchModulos, toggleModulo } = useModulosStore()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchModulos()
  }, [fetchModulos])

  const handleToggle = async (modulo: Modulo) => {
    setLoadingId(modulo.id)
    await toggleModulo(modulo.id)
    setLoadingId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestión de Módulos</h1>
        <p className="text-sm text-white/50 mt-1">Activa o desactiva los módulos del sistema</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Módulo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white/70 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {modulos.map((modulo) => (
                  <tr key={modulo.id} style={{ background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">{modulo.nombre}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/50">{modulo.descripcion || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggle(modulo)}
                        disabled={loadingId === modulo.id}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: modulo.activo
                            ? 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(34,197,94,0.6))'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.8), rgba(248,113,113,0.6))',
                          border: modulo.activo
                            ? '1px solid rgba(16,185,129,0.5)'
                            : '1px solid rgba(239,68,68,0.5)',
                          color: '#fff',
                        }}
                      >
                        {loadingId === modulo.id ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Actualizando...
                          </span>
                        ) : modulo.activo ? (
                          '✓ Activo'
                        ) : (
                          '✕ Inactivo'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {modulos.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/30">No hay módulos configurados</p>
            </div>
          )}
        </div>
      )}

      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.3)',
        }}
      >
        <p className="text-sm text-blue-300">
          💡 <strong>Nota:</strong> Los cambios se aplican inmediatamente. Los módulos desactivados no aparecerán en el menú lateral.
        </p>
      </div>
    </div>
  )
}
