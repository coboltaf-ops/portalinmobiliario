export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  // If already in DD/MM/AAAA format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr
  // From YYYY-MM-DD (input[type=date])
  const parts = dateStr.split('-')
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
  return dateStr
}

export function toInputDate(dateStr: string): string {
  if (!dateStr) return ''
  // From DD/MM/AAAA to YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/')
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

/** Formats a number with , for thousands and . for decimals */
export function fmtNum(v: number | string | undefined | null, decimals?: number): string {
  const n = Number(v)
  if (isNaN(n)) return '0'
  return n.toLocaleString('en-US', decimals !== undefined ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals } : undefined)
}

export function todayFormatted(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}
