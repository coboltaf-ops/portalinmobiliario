'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/store/auth-store'

export default function LoginPage() {
  const router = useRouter()
  const { setUser, users, logout, fetchUsers, loaded, loading: usersLoading, error: storeError } = useAuthStore()

  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    logout()
    fetchUsers()
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!loaded) {
      setError('Cargando usuarios... intenta de nuevo en un momento')
      return
    }

    if (users.length === 0) {
      setError('No hay usuarios disponibles. Contacta al administrador.')
      return
    }

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
    <div className="login-screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#1e3a8a' }}>
      {/* HEADER - Azul oscuro con logo y título */}
      <div style={{ background: '#1e3a8a', padding: '16px 32px', borderBottom: '1px solid rgba(0,30,77,0.2)', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Logo - Azul oscuro */}
        <div style={{ width: 64, height: 64, borderRadius: 8, background: '#001e4d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#001e4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        {/* Título */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#001e4d', margin: 0 }}>PORTAL INMOBILIARIO</h1>
      </div>

      {/* LOGIN CARD - Centrada debajo del header */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
        <div className="login-card" style={{ background: '#0f1b3d', border: '3px solid #1e3a8a', borderRadius: 20, padding: 40, width: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>Inicia Sesión</h2>
            <p style={{ color: '#ffffff', fontSize: 14 }}>
              {usersLoading ? 'Cargando usuarios...' : 'Inicia sesión en tu cuenta'}
            </p>
          </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ color: '#ffffff', fontSize: 12, marginBottom: 4, display: 'block' }}>Usuario</label>
            <input
              type="text"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="admin"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontSize: 14, outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ color: '#ffffff', fontSize: 12, marginBottom: 4, display: 'block' }}>Clave</label>
            <input
              type="password"
              required
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontSize: 14, outline: 'none' }}
            />
          </div>
          {(error || storeError) && <p style={{ color: '#ff6b6b', fontSize: 13, textAlign: 'center' }}>{error || storeError}</p>}
          <button
            type="submit"
            disabled={loading || usersLoading || !loaded}
            style={{ padding: '12px', borderRadius: 10, background: '#1e3a8a', color: '#ffffff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 8, opacity: loading || usersLoading || !loaded ? 0.5 : 1, transition: 'opacity 0.3s' }}
          >
            {usersLoading ? 'Cargando usuarios...' : loading ? 'Validando...' : 'Ingresar al Sistema'}
          </button>
        </form>
        </div>
      </div>
    </div>
  )
}
