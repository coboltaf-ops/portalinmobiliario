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
    <div className="login-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e3a8a', padding: '32px 16px' }}>
      {/* LOGIN CARD - Logo y Portal Inmobiliario DENTRO */}
      <div className="login-card" style={{ background: '#0f1b3d', border: '3px solid #1e3a8a', borderRadius: 20, padding: 40, width: 400 }}>
        {/* Logo y Título DENTRO de la tarjeta - Vertical */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#001e4d', margin: 0, textAlign: 'center', letterSpacing: 0.5 }}>PORTAL INMOBILIARIO</h1>
          {/* Ilustración de casa moderna debajo del título */}
          <img
            src="/casa-login.svg"
            alt="Casa Portal Inmobiliario"
            style={{ width: '100%', maxWidth: 240, height: 'auto', marginTop: 4 }}
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#001e4d', marginBottom: 4 }}>Inicia Sesión</h2>
          <p style={{ color: '#475569', fontSize: 14 }}>
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
  )
}
