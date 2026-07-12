'use client'

import { useState } from 'react'
import { useCorreosStore } from '@/features/correos-enviados/store/correos-store'
import VoiceSearchButton from '@/shared/components/voice-search-button'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

export default function CorreosEnviadosPage() {
  const { correos, deleteCorreo } = useCorreosStore()
  const [search, setSearch] = useState('')

  const filtered = correos.filter(c =>
    c.destinatario.toLowerCase().includes(search.toLowerCase()) ||
    c.asunto.toLowerCase().includes(search.toLowerCase()) ||
    c.consecutivo.toLowerCase().includes(search.toLowerCase()) ||
    c.fecha.includes(search)
  )

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este registro de correo?')) deleteCorreo(id)
  }

  return (
    <>
      {/* Header with Logo and Title */}
      <div className="flex items-center gap-4 px-8 py-4" style={{ background: '#001e4d' }}>
        <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#2563eb' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">PORTAL INMOBILIARIO</h1>
      </div>

      <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Correos Enviados</h1>

      <div className="flex items-center gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar correos..." className="flex-1 rounded-lg px-4 py-2 text-sm outline-none" style={inputSt} />
        <VoiceSearchButton onResult={setSearch} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Fecha', 'Hora', 'Destinatario', 'Asunto', 'Consecutivo', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="px-4 py-3 text-white/70">{c.fecha}</td>
                  <td className="px-4 py-3 text-white/70">{c.hora}</td>
                  <td className="px-4 py-3 text-white">{c.destinatario}</td>
                  <td className="px-4 py-3 text-white/70 max-w-xs truncate">{c.asunto}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{c.consecutivo}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>{c.estado}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-white/10" title="Eliminar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30">No hay correos enviados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  )
}
