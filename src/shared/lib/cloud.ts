// Helpers de cliente para leer/guardar colecciones en la NUBE (Vercel Blob) vía /api/data.
export async function getCol<T = unknown>(name: string): Promise<T | null> {
  try {
    const r = await fetch(`/api/data/${name}`, { cache: 'no-store' })
    if (!r.ok) return null
    return (await r.json()) as T | null
  } catch {
    return null
  }
}

export async function saveCol<T = unknown>(name: string, data: T): Promise<void> {
  try {
    await fetch(`/api/data/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch { /* offline: el cliente ya guardó en localStorage */ }
}
