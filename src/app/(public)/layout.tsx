'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEmpresaStore } from '@/features/datos-empresa/store/empresa-store'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { usePropiedadesStore } from '@/features/propiedades/store/propiedades-store'
import { useConfigStore } from '@/features/configuracion/store/configuracion-store'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const empresa = useEmpresaStore(s => s.empresa)
  const fetchEmpresa = useEmpresaStore(s => s.fetchEmpresa)
  const fetchPropiedades = usePropiedadesStore(s => s.fetchPropiedades)
  const fetchConfig = useConfigStore(s => s.fetchConfig)
  const { user, logout } = useAuthStore()

  useEffect(() => { fetchEmpresa(); fetchPropiedades(); fetchConfig() }, [fetchEmpresa, fetchPropiedades, fetchConfig])
  const vieneDelSistema = useRef(false)

  useEffect(() => {
    // Detectar si fue abierto desde el sistema (window.opener existe cuando se abre con window.open)
    if (window.opener) {
      vieneDelSistema.current = true
    }
  }, [])

  const handleSalir = () => {
    if (vieneDelSistema.current) {
      // Fue llamado desde Propiedades (window.open) -> cerrar pestaña y volver
      window.close()
    } else {
      // Entro directo al portal publico -> cerrar sesion y ir al login
      logout()
      router.push('/')
    }
  }

  const linkBase = 'relative text-sm font-semibold transition-colors py-1'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f1f5f9' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 12px rgba(2,6,23,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/inicio" className="flex items-center gap-3 min-w-0">
            {empresa?.logo ? (
              <img src={empresa.logo} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#2563eb' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
            )}
            <span className="font-extrabold text-lg truncate" style={{ color: '#0f172a' }}>{empresa?.nombre || 'Portal Inmobiliario'}</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/inicio" className={linkBase} style={{ color: pathname === '/inicio' ? '#2563eb' : '#475569' }}>
              Inicio
              {pathname === '/inicio' && <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full" style={{ background: '#2563eb' }} />}
            </Link>
            <Link href="/catalogo" className={linkBase} style={{ color: pathname === '/catalogo' ? '#2563eb' : '#475569' }}>
              Propiedades
              {pathname === '/catalogo' && <span className="absolute left-0 -bottom-1 h-0.5 w-full rounded-full" style={{ background: '#2563eb' }} />}
            </Link>
            {user && user.rol === 'Admin' && (
              <Link href="/dashboard" className="hidden sm:inline-flex px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90" style={{ background: '#2563eb', color: '#ffffff' }}>Acceso Administrativo</Link>
            )}
            <button onClick={handleSalir} className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: '#dc2626' }}>Salir</button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer style={{ background: '#0f172a' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {empresa?.logo ? (
                  <img src={empresa.logo} alt="" className="w-9 h-9 rounded-lg object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#2563eb' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                )}
                <h3 className="text-white font-bold">{empresa?.nombre || 'Portal Inmobiliario'}</h3>
              </div>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Tu aliado para encontrar la propiedad ideal.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Contacto</h3>
              {empresa?.telefono && <p className="text-sm mb-1" style={{ color: '#94a3b8' }}>Tel: {empresa.telefono}</p>}
              {empresa?.correo && <p className="text-sm mb-1" style={{ color: '#94a3b8' }}>{empresa.correo}</p>}
              {empresa?.direccion && <p className="text-sm" style={{ color: '#94a3b8' }}>{empresa.direccion}</p>}
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Enlaces</h3>
              <div className="flex flex-col gap-2">
                <Link href="/inicio" className="text-sm transition-colors hover:text-white" style={{ color: '#94a3b8' }}>Inicio</Link>
                <Link href="/catalogo" className="text-sm transition-colors hover:text-white" style={{ color: '#94a3b8' }}>Propiedades</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs" style={{ color: '#64748b' }}>&copy; {new Date().getFullYear()} {empresa?.nombre || 'Portal Inmobiliario'}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
