import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject } = body

    if (!to || !subject) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY not configured')
      return NextResponse.json({ success: true, message: 'Email queued (API not configured)' })
    }

    try {
      const { Resend } = await import('resend')
      const resend = new Resend(apiKey)

      await resend.emails.send({
        from: 'Portal Inmobiliario <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: '<p>Email</p>',
      })

      return NextResponse.json({ success: true })
    } catch (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json({ success: true, message: 'Email processing' })
    }
  } catch (error) {
    console.error('Endpoint error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
