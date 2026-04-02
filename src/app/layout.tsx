import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portal Inmobiliario',
  description: 'Sistema de Gestion Inmobiliaria',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen relative overflow-x-hidden bg-gray-950">
        <div className="fixed inset-0 -z-10 bg-gray-950" style={{ backgroundImage: 'radial-gradient(at 40% 20%, rgba(30,64,175,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(29,78,216,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(56,189,248,0.2) 0px, transparent 50%), radial-gradient(at 80% 50%, rgba(30,64,175,0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(30,64,175,0.2) 0px, transparent 50%)' }} />
        {children}
      </body>
    </html>
  )
}
