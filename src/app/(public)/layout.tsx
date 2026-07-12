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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #030712 0%, #0c1a3d 50%, #030712 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/inicio" className="flex items-center gap-3">
            {empresa?.logo ? (
              <img src={empresa.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(30,64,175,0.2)', border: '1px solid rgba(30,64,175,0.3)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
            )}
            <span className="text-white font-bold text-lg">{empresa?.nombre || 'Portal Inmobiliario'}</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/inicio" className={`text-sm font-medium transition-colors ${pathname === '/inicio' ? 'text-white' : 'text-white/60 hover:text-white'}`}>Inicio</Link>
            <Link href="/catalogo" className={`text-sm font-medium transition-colors ${pathname === '/catalogo' ? 'text-white' : 'text-white/60 hover:text-white'}`}>Propiedades</Link>
            {user && user.rol === 'Admin' && (
              <Link href="/dashboard" className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90" style={{ background: 'rgba(30,64,175,0.8)', border: '1px solid rgba(30,64,175,0.5)', color: '#ffffff' }}>Regresar al Acceso Administrativo</Link>
            )}
            <button onClick={handleSalir} className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: 'rgba(200,0,0,0.9)', border: '1px solid rgba(200,0,0,1)' }}>Salir</button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer style={{ background: 'rgba(3,7,18,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold mb-3">{empresa?.nombre || 'Portal Inmobiliario'}</h3>
              <p className="text-white/50 text-sm">Tu aliado para encontrar la propiedad ideal.</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Contacto</h3>
              {empresa?.telefono && <p className="text-white/50 text-sm">Tel: {empresa.telefono}</p>}
              {empresa?.correo && <p className="text-white/50 text-sm">{empresa.correo}</p>}
              {empresa?.direccion && <p className="text-white/50 text-sm">{empresa.direccion}</p>}
            </div>
            <div>
              <h3 className="text-white font-bold mb-3">Enlaces</h3>
              <div className="flex flex-col gap-1">
                <Link href="/inicio" className="text-white/50 text-sm hover:text-white transition-colors">Inicio</Link>
                <Link href="/catalogo" className="text-white/50 text-sm hover:text-white transition-colors">Propiedades</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} {empresa?.nombre || 'Portal Inmobiliario'}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
