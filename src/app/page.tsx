'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth-store'

export default function LoginPage() {
  const router = useRouter()
  const { setUser, users, logout, fetchUsers } = useAuthStore()

  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { logout(); fetchUsers() }, [logout, fetchUsers])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const found = users.find(
      (u) => u.usuario.toLowerCase() === usuario.trim().toLowerCase() && u.clave === clave
    )

    if (!found) {
      setError('Usuario o clave incorrectos')
      setLoading(false)
      return
    }

    setUser({ usuario: found.usuario, nombre: found.nombre, rol: found.rol })
    router.push('/dashboard')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #030712 0%, #0c1a3d 35%, #030712 65%, #091428 100%)' }}
    >
      <div className="fixed top-20 left-20 w-96 h-96 rounded-full blur-[128px] opacity-30 pointer-events-none" style={{ background: '#3b82f6' }} />
      <div className="fixed top-40 right-32 w-80 h-80 rounded-full blur-[128px] opacity-20 pointer-events-none" style={{ background: '#1d4ed8' }} />
      <div className="fixed bottom-20 left-1/2 w-72 h-72 rounded-full blur-[128px] opacity-25 pointer-events-none" style={{ background: '#38bdf8' }} />

      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl p-8 relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />

        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(30,64,175,0.2)', border: '1px solid rgba(30,64,175,0.3)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Portal Inmobiliario</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Inicia sesion en tu cuenta</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium text-center"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>Usuario</label>
            <input
              type="text"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.8)' }}>Clave</label>
            <input
              type="password"
              required
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-300 mt-2 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(30,64,175,0.8) 0%, rgba(59,130,246,0.6) 100%)',
              border: '1px solid rgba(30,64,175,0.5)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(30,64,175,0.3)',
            }}
          >
            {loading ? 'Validando...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}
