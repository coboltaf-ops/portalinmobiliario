import { NextRequest, NextResponse } from 'next/server'
import { readCollection, writeCollection } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noStore = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' }

const ALLOWED = [
  'propiedades', 'clientes', 'cotizaciones', 'solicitudes', 'contratos',
  'comerciales', 'usuarios', 'roles', 'empresa', 'configuracion', 'correos', 'modulos',
]

type Ctx = { params: Promise<{ collection: string }> }

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { collection } = await ctx.params
  if (!ALLOWED.includes(collection)) return NextResponse.json({ error: 'Colección no permitida' }, { status: 400, headers: noStore })
  const data = await readCollection(collection)
  return NextResponse.json(data ?? null, { headers: noStore })
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { collection } = await ctx.params
  if (!ALLOWED.includes(collection)) return NextResponse.json({ error: 'Colección no permitida' }, { status: 400, headers: noStore })
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400, headers: noStore }) }
  const ok = await writeCollection(collection, body)
  return NextResponse.json({ ok }, { headers: noStore })
}
