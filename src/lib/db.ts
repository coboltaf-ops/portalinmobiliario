import { put, list, del, get } from '@vercel/blob'

// Persistencia en la NUBE con Vercel Blob (reemplaza a Supabase).
// Cada colección se guarda como un blob JSON con nombre único por timestamp;
// el más reciente es el vigente. Si no hay token/blobs, devuelve null (el
// cliente usa sus datos demo como respaldo).
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN || !!process.env.BLOB_STORE_ID
let blobSuspended = false

function makeName(collection: string): string {
  return `${collection}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`
}

export async function readCollection<T = unknown>(collection: string): Promise<T | null> {
  if (!USE_BLOB || blobSuspended) return null
  try {
    const { blobs } = await list({ prefix: `${collection}/` })
    if (blobs.length === 0) return null
    const latest = [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    const res = await get(latest.pathname, { access: 'private', useCache: false })
    const text = await new Response(res.stream).text()
    return JSON.parse(text) as T
  } catch (err) {
    if (err instanceof Error && err.message.includes('suspended')) blobSuspended = true
    return null
  }
}

export async function writeCollection<T = unknown>(collection: string, data: T): Promise<boolean> {
  if (!USE_BLOB || blobSuspended) return false
  try {
    await put(makeName(collection), JSON.stringify(data), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      cacheControlMaxAge: 0,
    })
    // Limpiar blobs antiguos de la misma colección (dejar los 3 más recientes)
    try {
      const { blobs } = await list({ prefix: `${collection}/` })
      if (blobs.length > 3) {
        const sorted = [...blobs].sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
        await del(sorted.slice(3).map(b => b.url))
      }
    } catch { /* limpieza no crítica */ }
    return true
  } catch (err) {
    if (err instanceof Error && err.message.includes('suspended')) blobSuspended = true
    return false
  }
}
