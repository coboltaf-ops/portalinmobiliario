'use client'
import { useState } from 'react'

export const dynamic = 'force-dynamic'

// ── Landing NEUTRA (sin marca visible) para captar interesados en el software
// "Portal Inmobiliario". Envía cada lead al CRM externo vía POST cross-origin
// (CORS abierto) a /api/prospectos-externo con linea_interes = "Portal Inmobiliario".
const CRM_ENDPOINT = 'https://consultorpalomares.vercel.app/api/prospectos-externo'

const PAISES = ['Colombia', 'Perú', 'Ecuador', 'México', 'Panamá', 'Costa Rica', 'Chile', 'Argentina', 'Bolivia', 'Venezuela', 'República Dominicana', 'Estados Unidos', 'España', 'Otro']

const AREAS: { ico: string; tag: string; titulo: string; items: [string, string][] }[] = [
  { ico: '🏠', tag: 'Inmuebles', titulo: 'Catálogo de Inmuebles', items: [
    ['Ficha completa', 'Fotos, precio, área, habitaciones, baños, parqueaderos y ubicación.'],
    ['Tipos y estados', 'Casas, apartamentos, locales, oficinas y lotes; disponible, reservado, vendido o arrendado.'],
    ['Venta y arriendo', 'El mismo inmueble para venta o arrendamiento, con su valor y condiciones.'],
  ]},
  { ico: '🌐', tag: 'Portal Web', titulo: 'Publicación y Vitrina', items: [
    ['Vitrina pública', 'Tu portal web con buscador y filtros por zona, precio, tipo y características.'],
    ['Ficha compartible', 'Cada inmueble con enlace propio para compartir por WhatsApp y redes.'],
    ['Marca propia', 'La vitrina lleva tu logo y datos de contacto — los interesados llegan a ti.'],
  ]},
  { ico: '🔑', tag: 'Captación', titulo: 'Captación de Propiedades', items: [
    ['Propietarios', 'Registra propietarios y los inmuebles que dan en consignación.'],
    ['Consignación y exclusividad', 'Controla vigencia, exclusividad y condiciones de cada captación.'],
    ['Documentos', 'Adjunta escrituras, certificados y autorizaciones por inmueble.'],
  ]},
  { ico: '👥', tag: 'Demanda', titulo: 'Clientes y Demanda', items: [
    ['Compradores y arrendatarios', 'Registra qué busca cada cliente: zona, presupuesto y características.'],
    ['Cruce oferta–demanda', 'El sistema sugiere inmuebles que encajan con lo que pide cada cliente.'],
    ['Seguimiento comercial', 'Pipeline de interesados con etapas hasta el cierre.'],
  ]},
  { ico: '📅', tag: 'Operación', titulo: 'Visitas y Negocios', items: [
    ['Agenda de visitas', 'Programa y confirma visitas, con recordatorios al asesor y al cliente.'],
    ['Oportunidades', 'Cada negocio de venta o arriendo con su estado y valor.'],
    ['Ofertas y reservas', 'Registra ofertas, separaciones y reservas de cada inmueble.'],
  ]},
  { ico: '📄', tag: 'Cierre', titulo: 'Contratos, Cartera y Comisiones', items: [
    ['Contratos', 'Genera contratos de compraventa y de arrendamiento listos para firmar.'],
    ['Cartera de arriendos', 'Cobro mensual de cánones, con estado de pago y mora.'],
    ['Comisiones', 'Liquida automáticamente las comisiones de cada asesor por negocio cerrado.'],
  ]},
]

type Estado = 'idle' | 'enviando' | 'ok' | 'error'

export default function DemoLanding() {
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
    <main className="pi">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <header className="nav">
        <div className="wrap nav-in">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">⌂</span>
            <span className="brand-txt"><strong>Portal Inmobiliario</strong><em>Software para inmobiliarias</em></span>
          </div>
          <a href="#registro" className="btn btn-gold btn-sm">Solicitar demo</a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <span className="eyebrow">Portal + CRM para Inmobiliarias</span>
            <h1>Publica, gestiona y <span className="gold">cierra</span> más negocios inmobiliarios.</h1>
            <p className="lead">
              Un solo sistema para tu <strong>catálogo de inmuebles, tu portal web, la captación de propiedades,
              los clientes, las visitas, los contratos y las comisiones</strong>. Del aviso al cierre, todo
              organizado y en línea.
            </p>
            <div className="cta-row">
              <a href="#registro" className="btn btn-gold btn-lg">Solicita una demo →</a>
              <a href="#modulos" className="btn btn-ghost btn-lg">Ver qué incluye</a>
            </div>
            <div className="hero-stats">
              <div><b>1</b><span>portal con tu marca</span></div>
              <div><b>6</b><span>áreas integradas</span></div>
              <div><b>∞</b><span>inmuebles publicables</span></div>
            </div>
          </div>

          <aside className="mock" aria-hidden="true">
            <div className="prop">
              <div className="prop-photo"><span className="prop-badge">En venta</span></div>
              <div className="prop-body">
                <span className="prop-price">$ 480.000.000</span>
                <span className="prop-loc">Apartamento · El Poblado, Medellín</span>
                <div className="prop-specs"><span>84 m²</span><span>3 hab</span><span>2 baños</span><span>1 parq</span></div>
              </div>
            </div>
            <div className="mock-kpis">
              {[['Inmuebles activos', '142'], ['Visitas / mes', '68'], ['Cierres / mes', '11'], ['Cartera arriendos', '$ 96 M']].map(k => (
                <div className="mk" key={k[0]}><span className="mk-k">{k[0]}</span><span className="mk-v">{k[1]}</span></div>
              ))}
            </div>
            <span className="mock-foot">Ejemplo ilustrativo · datos de muestra</span>
          </aside>
        </div>
      </section>

      {/* FRANJA */}
      <section className="strip">
        <div className="wrap strip-in">
          <span>🏠 Inmuebles</span><span>🌐 Portal web</span><span>🔑 Captación</span>
          <span>👥 Clientes</span><span>📅 Visitas</span><span>📄 Contratos y comisiones</span>
        </div>
      </section>

      {/* MÓDULOS */}
      <section className="modulos" id="modulos">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Todo lo que incluye</span>
            <h2>Del aviso al cierre, en un solo lugar</h2>
            <p className="sec-sub">Publica tus inmuebles en tu propio portal y gestiona propietarios, clientes, visitas, contratos y comisiones sin perder el hilo de ningún negocio.</p>
          </div>
          <div className="area-grid">
            {AREAS.map(a => (
              <article className="area" key={a.tag}>
                <div className="area-top">
                  <span className="area-ico" aria-hidden="true">{a.ico}</span>
                  <div><span className="area-tag">{a.tag}</span><h3>{a.titulo}</h3></div>
                </div>
                <ul>
                  {a.items.map(([t, d]) => (
                    <li key={t}><span className="chk" aria-hidden="true">✓</span><span><strong>{t}.</strong> {d}</span></li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* INDICADORES */}
      <section className="kpis">
        <div className="wrap kpis-in">
          <div className="kpis-copy">
            <span className="eyebrow light">Control del negocio</span>
            <h2>Sabe qué se mueve y qué deja plata</h2>
            <p>Indicadores en vivo de tu operación: <strong>inmuebles activos, visitas, negocios en curso, cierres, cartera de arriendos y comisiones</strong> por asesor.</p>
          </div>
          <div className="kpis-grid">
            {[['Inmuebles y disponibilidad', 'activos, reservados y cerrados'], ['Visitas y negocios', 'agenda y pipeline por asesor'], ['Cartera de arriendos', 'cánones cobrados y en mora'], ['Comisiones', 'liquidación por negocio cerrado']].map(k => (
              <div className="kpi" key={k[0]}><span className="kpi-t">{k[0]}</span><span className="kpi-d">{k[1]}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRO */}
      <section className="registro" id="registro">
        <div className="wrap reg-in">
          <div className="reg-copy">
            <h2>Solicita tu demo</h2>
            <p>Déjanos tus datos y en <strong>pocas horas nos comunicaremos contigo</strong> para mostrarte tu Portal Inmobiliario con tu marca.</p>
          </div>
          {estado === 'ok' ? (
            <div className="reg-ok" role="status">
              <span className="ok-badge">✓</span>
              <h3>¡Gracias por tu interés!</h3>
              <p>Recibimos tus datos. En pocas horas nos comunicaremos contigo.</p>
              <button type="button" className="btn btn-ghost-dark" onClick={() => setEstado('idle')}>Enviar otra solicitud</button>
            </div>
          ) : (
            <form className="reg-form" onSubmit={enviar} noValidate>
              <div className="grid2">
                <label>Nombre<input value={form.nombre} onChange={set('nombre')} required /></label>
                <label>Apellido<input value={form.apellido} onChange={set('apellido')} required /></label>
              </div>
              <label>Empresa / Inmobiliaria<input value={form.empresa} onChange={set('empresa')} required /></label>
              <div className="grid2">
                <label>Correo<input type="email" value={form.correo} onChange={set('correo')} required /></label>
                <label>Móvil / WhatsApp<input value={form.movil} onChange={set('movil')} required /></label>
              </div>
              <div className="grid2">
                <label>País<select value={form.pais} onChange={set('pais')}>{PAISES.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
                <label>Ciudad<input value={form.ciudad} onChange={set('ciudad')} placeholder="Opcional" /></label>
              </div>
              <label>¿Qué necesitas gestionar?<textarea value={form.requerimiento} onChange={set('requerimiento')} rows={3} placeholder="Ventas, arriendos, portal web… cuéntanos (opcional)" /></label>
              {estado === 'error' && <p className="reg-err">Revisa los campos obligatorios: nombre, apellido, empresa, correo y móvil.</p>}
              <button type="submit" className="btn btn-gold btn-lg btn-full" disabled={estado === 'enviando'}>
                {estado === 'enviando' ? 'Enviando…' : 'Quiero mi Portal Inmobiliario'}
              </button>
              <p className="reg-legal">Al registrarte aceptas ser contactado por nuestro equipo comercial.</p>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="wrap foot-in">
          <div className="brand">
            <span className="brand-mark">⌂</span>
            <span className="brand-txt"><strong>Portal Inmobiliario</strong><em>Portal + CRM para inmobiliarias</em></span>
          </div>
          <div className="foot-meta">
            <span>Publica · Gestiona · Cierra</span>
            <span>© 2026 Portal Inmobiliario</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

const CSS = `
.pi{
  --green:#001e4d; --green2:#1e3a8a; --leaf:#2563eb;
  --gold:#2563eb; --gold-soft:#93c5fd;
  --bg:#f4f7fc; --paper:#ffffff; --ink:#0f172a; --ink-soft:#475569; --line:#dbe4f5;
  font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  color:var(--ink); background:var(--bg); -webkit-font-smoothing:antialiased;
}
.pi *{box-sizing:border-box}
/* ── Overrides: neutralizar reglas !important del globals.css del portal ── */
.pi input,.pi textarea,.pi select{border:1px solid var(--line) !important;color:var(--ink) !important;background:#f8faf8 !important;font-size:18.0px !important;border-radius:10px !important}
.pi input:focus,.pi textarea:focus,.pi select:focus{border-color:var(--leaf) !important;box-shadow:0 0 0 3px rgba(37,99,235,.16) !important}
.pi label{font-weight:700 !important;color:var(--green) !important;font-size:15.6px !important}
.pi .reg-form{background:var(--paper) !important;color:var(--ink) !important}
.wrap{max-width:1140px;margin:0 auto;padding:0 24px}
.pi h1,.pi h2,.pi h3{font-family:'Playfair Display',Georgia,serif;font-weight:700;letter-spacing:-.01em;margin:0}
.gold{color:var(--gold)}
.eyebrow{display:inline-block;font-size:14.4px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--leaf)}
.eyebrow.light{color:var(--gold-soft)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:11px;font-weight:600;font-size:18.0px;text-decoration:none;cursor:pointer;border:1px solid transparent;padding:11px 20px;line-height:1;transition:transform .12s ease,box-shadow .12s ease,background .12s ease}
.btn-lg{padding:15px 28px;font-size:19.2px}
.btn-sm{padding:9px 17px;font-size:16.8px}
.btn-full{width:100%}
.btn-gold{background:var(--gold);color:#ffffff;font-weight:800;box-shadow:0 8px 22px rgba(37,99,235,.34)}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(37,99,235,.44)}
.btn-ghost{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.32)}
.btn-ghost:hover{background:rgba(255,255,255,.18)}
.btn-ghost-dark{background:#fff;color:var(--green);border-color:var(--line)}
.btn:disabled{opacity:.65;cursor:progress;transform:none}
.nav{position:sticky;top:0;z-index:20;background:rgba(0,30,77,.94);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.08)}
.nav-in{display:flex;align-items:center;justify-content:space-between;height:66px}
.brand{display:flex;align-items:center;gap:11px}
.brand-mark{color:var(--gold);font-size:31.2px;line-height:1}
.brand-txt{display:flex;flex-direction:column;line-height:1.08}
.brand-txt strong{font-family:'Playfair Display',serif;font-size:20.4px;color:#fff}
.brand-txt em{font-style:normal;font-size:13.2px;letter-spacing:.06em;color:#a9bfe0}
.hero{background:radial-gradient(700px 340px at 88% -10%, rgba(37,99,235,.4) 0%, rgba(37,99,235,0) 60%),linear-gradient(155deg,#001229 0%,var(--green) 55%,var(--green2) 120%);color:#fff;padding:70px 0 78px}
.hero-in{display:grid;grid-template-columns:1.12fr .88fr;gap:48px;align-items:center}
.hero-copy .eyebrow{color:var(--gold-soft)}
.hero-copy h1{font-size:62.4px;line-height:1.05;margin:16px 0 0;color:#fff}
.lead{font-size:21.6px;line-height:1.62;color:#cfe0f5;margin:20px 0 0;max-width:35em}
.lead strong{color:#fff}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;margin:30px 0 0}
.hero-stats{display:flex;gap:32px;margin:34px 0 0;padding-top:24px;border-top:1px solid rgba(255,255,255,.14)}
.hero-stats div{display:flex;flex-direction:column}
.hero-stats b{font-family:'Playfair Display',serif;font-size:36.0px;color:var(--gold-soft)}
.hero-stats span{font-size:15.0px;color:#a9bfe0;letter-spacing:.03em}
.mock{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:16px;box-shadow:0 30px 66px rgba(0,0,0,.4)}
.prop{background:var(--paper);border-radius:14px;overflow:hidden;box-shadow:0 10px 24px rgba(0,0,0,.2)}
.prop-photo{height:132px;background:linear-gradient(135deg,#2563eb 0%,#1e3a8a 55%,#001e4d 100%);position:relative}
.prop-badge{position:absolute;top:10px;left:10px;background:var(--gold);color:#ffffff;font-size:13.2px;font-weight:800;padding:4px 10px;border-radius:999px}
.prop-body{padding:14px 16px}
.prop-price{display:block;font-family:'Playfair Display',serif;font-size:28.8px;font-weight:800;color:var(--green)}
.prop-loc{display:block;font-size:15.6px;color:var(--ink-soft);margin:2px 0 10px}
.prop-specs{display:flex;gap:8px;flex-wrap:wrap}
.prop-specs span{font-size:13.8px;font-weight:600;color:var(--green2);background:#eff6ff;border:1px solid #dbeafe;border-radius:8px;padding:4px 9px}
.mock-kpis{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0 0}
.mk{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:11px 13px;display:flex;flex-direction:column;gap:3px}
.mk-k{font-size:12.6px;letter-spacing:.04em;text-transform:uppercase;color:#a9bfe0;font-weight:700}
.mk-v{font-family:'Playfair Display',serif;font-size:25.2px;font-weight:700;color:#fff}
.mock-foot{display:block;margin-top:9px;font-size:12.6px;color:#8fa6cf;text-align:right}
.strip{background:var(--gold)}
.strip-in{display:flex;flex-wrap:wrap;gap:8px 34px;justify-content:center;padding:16px 24px;font-weight:800;font-size:17.4px;color:#ffffff}
.modulos{padding:78px 0;background:var(--bg)}
.sec-head{text-align:center;max-width:680px;margin:0 auto 44px}
.sec-head h2{font-size:43.2px;color:var(--green);margin-top:10px}
.sec-sub{color:var(--ink-soft);font-size:19.2px;line-height:1.6;margin-top:12px}
.area-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.area{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:24px;transition:transform .14s ease,box-shadow .14s ease}
.area:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(0,30,77,.12)}
.area-top{display:flex;gap:13px;align-items:center;margin-bottom:16px}
.area-ico{flex:none;width:48px;height:48px;border-radius:13px;background:linear-gradient(150deg,#eff6ff,#dbeafe);display:flex;align-items:center;justify-content:center;font-size:28.8px}
.area-tag{font-size:13.2px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--leaf)}
.area h3{font-size:22.8px;color:var(--green);line-height:1.15;margin-top:2px}
.area ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.area li{display:flex;gap:10px;font-size:16.2px;line-height:1.5;color:var(--ink-soft)}
.area li strong{color:var(--ink)}
.chk{flex:none;width:19px;height:19px;border-radius:50%;background:var(--leaf);color:#fff;font-size:13.2px;display:flex;align-items:center;justify-content:center;margin-top:1px}
.kpis{padding:74px 0;background:linear-gradient(155deg,var(--green) 0%,var(--green2) 100%);color:#fff}
.kpis-in{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center}
.kpis-copy h2{font-size:40.8px;color:#fff;margin:10px 0 14px}
.kpis-copy p{color:#cfe0f5;font-size:19.2px;line-height:1.62;max-width:32em}
.kpis-copy strong{color:var(--gold-soft)}
.kpis-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.kpi{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:18px}
.kpi-t{display:block;font-family:'Playfair Display',serif;font-size:20.4px;font-weight:700;margin-bottom:5px;color:#fff}
.kpi-d{font-size:15.6px;color:#a9bfe0}
.registro{padding:80px 0;background:var(--bg)}
.reg-in{display:grid;grid-template-columns:1fr 1.05fr;gap:48px;align-items:start}
.reg-copy h2{font-size:48.0px;color:var(--green)}
.reg-copy p{color:var(--ink-soft);font-size:20.4px;line-height:1.6;margin-top:16px;max-width:26em}
.reg-copy strong{color:var(--ink)}
.reg-form{border:1px solid var(--line);border-radius:20px;padding:28px;box-shadow:0 22px 52px rgba(0,30,77,.1);display:flex;flex-direction:column;gap:14px}
.reg-form label{display:flex;flex-direction:column;gap:6px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.reg-form textarea{resize:vertical}
.reg-err{color:#c0392b;font-size:16.2px;font-weight:600;margin:0}
.reg-legal{font-size:14.4px;color:var(--ink-soft);text-align:center;margin:2px 0 0}
.reg-ok{background:var(--paper);border:1px solid var(--line);border-radius:20px;padding:40px 28px;text-align:center;box-shadow:0 22px 52px rgba(0,30,77,.1);display:flex;flex-direction:column;align-items:center;gap:12px}
.ok-badge{width:56px;height:56px;border-radius:50%;background:var(--leaf);color:#fff;font-size:33.6px;display:flex;align-items:center;justify-content:center}
.reg-ok h3{font-size:28.8px;color:var(--green)}
.reg-ok p{color:var(--ink-soft);margin:0 0 8px}
.foot{background:#001229;color:#a9bfe0;padding:34px 0}
.foot-in{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.foot .brand-mark{color:var(--gold-soft)}
.foot .brand-txt strong{color:#fff}
.foot .brand-txt em{color:#8fa6cf}
.foot-meta{display:flex;flex-direction:column;gap:4px;text-align:right;font-size:15.6px}
@media (max-width:980px){
  .hero-in,.kpis-in,.reg-in{grid-template-columns:1fr;gap:34px}
  .area-grid{grid-template-columns:1fr 1fr}
  .hero-copy h1{font-size:48.0px}
  .mock{order:2}
  .foot-in{flex-direction:column;align-items:flex-start}
  .foot-meta{text-align:left}
}
@media (max-width:620px){.area-grid{grid-template-columns:1fr}}
`
