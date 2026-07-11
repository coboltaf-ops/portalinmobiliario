'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { useFetchData } from '@/shared/hooks/use-fetch-data'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  useFetchData()
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
    { name: 'Propiedades', href: '/propiedades', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { name: 'Comerciales', href: '/comerciales', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { name: 'Solicitudes', href: '/solicitudes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { name: 'Clientes/Prospectos', href: '/clientes', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
    { name: 'Cotizaciones', href: '/cotizaciones', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { name: 'Contratos', href: '/contratos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Correos Enviados', href: '/correos-enviados', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Datos Empresa', href: '/datos-empresa', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m0 0h14m-14 0H3m14 0h2M9 7h1m-1 4h1m4-4h1m-1 4h1' },
    { name: 'Tablas Referencia', href: '/configuracion', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ]

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#001e4d] border-r border-white/10 z-50 flex flex-col">
        <div className="px-6 py-5 shrink-0 flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(30,64,175,0.2)', border: '1px solid rgba(30,64,175,0.3)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <p className="text-white font-semibold text-sm tracking-wide text-center">Portal Inmobiliario</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-white bg-[#0a3d99] border border-[#1e64d4] shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-[#0a2460]'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-white/5 w-full"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 flex flex-col min-h-screen bg-white">
        <header className="px-8 py-3 shrink-0 flex items-center justify-between bg-white" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <div className="w-16" />
          {user && (
            <div className="text-center flex-1">
              <p className="text-sm font-black text-[#001e4d]">{user.nombre.toUpperCase()}</p>
              <p className="text-xs font-bold text-[#001e4d]/70">{user.rol?.toUpperCase() || 'USUARIO'}</p>
            </div>
          )}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'rgba(200,0,0,0.9)', border: '1px solid rgba(200,0,0,1)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Inicio
          </button>
        </header>
        <div className="flex-1 p-8 overflow-x-auto bg-white">
          {children}
        </div>
      </main>
    </div>
  )
}
