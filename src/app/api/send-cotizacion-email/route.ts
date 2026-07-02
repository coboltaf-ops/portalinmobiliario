import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const body = await request.json()
    const { to, subject, nroCotizacion, clienteNombre, propiedadNombre, precio, condiciones, empresaNombre } = body

    if (!to || !subject) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const htmlContent = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;padding:20px;background:#1e3a5f;color:#fff;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:24px">${empresaNombre}</h1>
          <p style="margin:5px 0 0;opacity:0.8">Cotizacion Inmobiliaria</p>
        </div>
        <div style="padding:30px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:0 0 12px 12px">
          <h2 style="color:#1e3a5f;margin-top:0">Cotizacion ${nroCotizacion}</h2>
          <p>Estimado/a <strong>${clienteNombre}</strong>,</p>
          <p>Le hacemos llegar la cotizacion de la siguiente propiedad:</p>
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0">
            <h3 style="margin-top:0;color:#1e3a5f">${propiedadNombre}</h3>
            <p style="font-size:28px;font-weight:bold;color:#1e3a5f;margin:10px 0">${precio}</p>
            ${condiciones ? `<p><strong>Condiciones de Pago:</strong><br/>${condiciones}</p>` : ''}
          </div>
          <p>Quedamos a su disposicion para cualquier consulta adicional.</p>
          <p>Atentamente,<br/><strong>${empresaNombre}</strong></p>
        </div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: 'Portal Inmobiliario <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: htmlContent,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
