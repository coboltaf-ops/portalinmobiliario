import * as XLSX from 'xlsx'

export function exportToExcel(data: Record<string, unknown>[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Datos')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function printTable(title: string, headers: string[], rows: string[][]) {
  const w = window.open('', '_blank')
  if (!w) return
  const tableRows = rows.map(r => `<tr>${r.map(c => `<td style="border:1px solid #ccc;padding:6px 10px;font-size:12px">${c}</td>`).join('')}</tr>`).join('')
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title></head><body style="font-family:Arial;padding:20px">
    <h2>${title}</h2>
    <table style="border-collapse:collapse;width:100%">
      <thead><tr>${headers.map(h => `<th style="border:1px solid #999;padding:8px 10px;background:#f0f0f0;font-size:12px;text-align:left">${h}</th>`).join('')}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <script>setTimeout(()=>window.print(),500)</script>
  </body></html>`)
  w.document.close()
}

export function exportToPDF(title: string, headers: string[], rows: string[][]) {
  const w = window.open('', '_blank')
  if (!w) return
  const tableRows = rows.map(r => `<tr>${r.map(c => `<td style="border:1px solid #ccc;padding:5px 8px;font-size:11px">${c}</td>`).join('')}</tr>`).join('')
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title></head><body style="font-family:Arial;padding:20px">
    <h2 style="margin-bottom:15px">${title}</h2>
    <table style="border-collapse:collapse;width:100%">
      <thead><tr>${headers.map(h => `<th style="border:1px solid #999;padding:6px 8px;background:#e0e0e0;font-size:11px;text-align:left">${h}</th>`).join('')}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <script>setTimeout(()=>window.print(),500)</script>
  </body></html>`)
  w.document.close()
}
