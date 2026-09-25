'use client'
import { useState } from 'react'

export const dynamic = 'force-dynamic'

// ── Página SOLO FORMULARIO (sin presentación del sistema). Neutra, sin marca
// Consultor Palomares. Envía cada lead al CRM externo (POST /api/prospectos-externo).
const CRM_ENDPOINT = 'https://consultorpalomares.vercel.app/api/prospectos-externo'
const PAISES = ['Colombia', 'Perú', 'Ecuador', 'México', 'Panamá', 'Costa Rica', 'Chile', 'Argentina', 'Bolivia', 'Venezuela', 'República Dominicana', 'Estados Unidos', 'España', 'Otro']

type Estado = 'idle' | 'enviando' | 'ok' | 'error'

export default function FormularioPage() {
  const [form, setForm] = useState({ nombre: '', apellido: '', empresa: '', correo: '', movil: '', pais: 'Colombia', ciudad: '', requerimiento: '' })
  const [estado, setEstado] = useState<Estado>('idle')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.apellido.trim() || !form.correo.trim() || !form.empresa.trim() || !form.movil.trim()) {
      setEstado('error'); return
    }
    setEstado('enviando')
    try {
      const res = await fetch(CRM_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(), apellido: form.apellido.trim(), empresa: form.empresa.trim(),
          correo: form.correo.trim(), nro_movil: form.movil.trim(), pais: form.pais || 'Colombia',
          ciudad: form.ciudad.trim() || 'Medellín', linea_interes: 'Portal Inmobiliario',
          descripcion_requerimiento: form.requerimiento.trim(), acepta_datos: true,
        }),
      })
      if (!res.ok) throw new Error('fallo')
      setEstado('ok')
      setForm({ nombre: '', apellido: '', empresa: '', correo: '', movil: '', pais: 'Colombia', ciudad: '', requerimiento: '' })
    } catch { setEstado('error') }
  }

  return (
    <main className="fp">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="fp-card">
        <div className="fp-head">
          <span className="fp-mark" aria-hidden="true">⌂</span>
          <div>
            <h1>Solicita tu demo</h1>
            <p>Déjanos tus datos y en pocas horas te contactamos.</p>
          </div>
        </div>

        {estado === 'ok' ? (
          <div className="fp-ok" role="status">
            <span className="ok-badge">✓</span>
            <h2>¡Gracias por tu interés!</h2>
            <p>Recibimos tus datos. En pocas horas nos comunicaremos contigo.</p>
            <button type="button" className="btn ghost" onClick={() => setEstado('idle')}>Enviar otra solicitud</button>
          </div>
        ) : (
          <form className="fp-form" onSubmit={enviar} noValidate>
            <div className="g2">
              <label>Nombre<input value={form.nombre} onChange={set('nombre')} required /></label>
              <label>Apellido<input value={form.apellido} onChange={set('apellido')} required /></label>
            </div>
            <label>Empresa / Inmobiliaria<input value={form.empresa} onChange={set('empresa')} required /></label>
            <div className="g2">
              <label>Correo<input type="email" value={form.correo} onChange={set('correo')} required /></label>
              <label>Móvil / WhatsApp<input value={form.movil} onChange={set('movil')} required /></label>
            </div>
            <div className="g2">
              <label>País<select value={form.pais} onChange={set('pais')}>{PAISES.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
              <label>Ciudad<input value={form.ciudad} onChange={set('ciudad')} placeholder="Opcional" /></label>
            </div>
            <label>¿Qué necesitas gestionar?<textarea value={form.requerimiento} onChange={set('requerimiento')} rows={3} placeholder="Ventas, arriendos, portal web… (opcional)" /></label>
            {estado === 'error' && <p className="fp-err">Revisa los campos obligatorios: nombre, apellido, empresa, correo y móvil.</p>}
            <button type="submit" className="btn primary" disabled={estado === 'enviando'}>
              {estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud'}
            </button>
            <p className="fp-legal">Al registrarte aceptas ser contactado por nuestro equipo comercial.</p>
          </form>
        )}
      </div>
    </main>
  )
}

const CSS = `
.fp{ --navy:#001e4d; --blue:#1e3a8a; --blue2:#2563eb; --line:#dbe4f5; --ink:#0f172a; --muted:#475569;
  min-height:100vh; display:flex; align-items:center; justify-content:center; padding:28px 16px;
  background:radial-gradient(900px 500px at 80% -10%, rgba(37,99,235,.45) 0%, rgba(37,99,235,0) 60%), linear-gradient(160deg,#001229 0%, var(--navy) 55%, var(--blue) 120%);
  font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif; }
.fp *{ box-sizing:border-box }
.fp-card{ width:100%; max-width:560px; background:#fff; border-radius:22px; padding:30px 30px 26px; box-shadow:0 30px 70px rgba(0,0,0,.4); }
.fp-head{ display:flex; align-items:center; gap:14px; margin-bottom:22px; }
.fp-mark{ width:56px; height:56px; flex:none; border-radius:14px; background:var(--navy); color:#fff; font-size:30px; display:flex; align-items:center; justify-content:center; }
.fp-head h1{ font-size:28px; font-weight:800; color:var(--navy); margin:0; letter-spacing:-.5px; }
.fp-head p{ font-size:15px; color:var(--muted); margin:3px 0 0; }
.fp-form{ display:flex; flex-direction:column; gap:15px; }
.fp-form label{ display:flex; flex-direction:column; gap:6px; font-size:14px !important; font-weight:700 !important; color:var(--navy) !important; }
.g2{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.fp-form input,.fp-form textarea,.fp-form select{ font-family:inherit; font-size:16px !important; color:var(--ink) !important; background:#f8fafc !important; border:1.5px solid var(--line) !important; border-radius:11px !important; padding:13px 14px !important; outline:none; }
.fp-form input:focus,.fp-form textarea:focus,.fp-form select:focus{ border-color:var(--blue2) !important; box-shadow:0 0 0 3px rgba(37,99,235,.18) !important; }
.fp-form textarea{ resize:vertical; }
.btn{ border:none; cursor:pointer; border-radius:12px; font-weight:800; font-size:17px; padding:15px; transition:transform .12s, box-shadow .12s, background .12s; }
.btn.primary{ background:var(--blue2); color:#fff; box-shadow:0 10px 26px rgba(37,99,235,.4); }
.btn.primary:hover{ transform:translateY(-2px); box-shadow:0 14px 32px rgba(37,99,235,.5); }
.btn.primary:disabled{ opacity:.65; cursor:progress; transform:none; }
.btn.ghost{ background:#fff; color:var(--navy); border:1.5px solid var(--line); }
.fp-err{ color:#dc2626; font-size:14px; font-weight:700; margin:0; }
.fp-legal{ font-size:12.5px; color:var(--muted); text-align:center; margin:2px 0 0; }
.fp-ok{ text-align:center; display:flex; flex-direction:column; align-items:center; gap:12px; padding:14px 4px; }
.ok-badge{ width:64px; height:64px; border-radius:50%; background:var(--blue2); color:#fff; font-size:32px; display:flex; align-items:center; justify-content:center; }
.fp-ok h2{ font-size:24px; color:var(--navy); margin:0; }
.fp-ok p{ color:var(--muted); margin:0 0 8px; }
@media (max-width:520px){ .g2{ grid-template-columns:1fr; } .fp-card{ padding:24px 20px; } }
`
