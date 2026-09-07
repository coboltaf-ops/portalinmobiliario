// Helper central de colores de ESTADO / SITUACIÓN para todos los módulos.
// Regla oficial: color INTENSO sólido + texto BLANCO INTENSO en todos los módulos.

export type EstadoBadgeStyle = {
  background: string
  color: string
  border: string
  fontWeight: number
}

// Paleta intensa (alineada con el estándar de botones de globals.css)
const VERDE = '#15803d' // positivo: activo, vendida, aceptada, vigente, atendida, cliente
const ROJO = '#dc2626' // negativo: inactivo, rechazada, cancelado, descartada
const AZUL = '#1e3a8a' // info/por defecto: disponible, finalizado, en atención, admin
const NARANJA = '#ea580c' // pendiente/en curso: pendiente, nueva, borrador, reservada, prospecto
const MORADO = '#7c3aed' // alquilada
const GRIS = '#475569' // otros / sin clasificar

// Mapa por palabra clave (se compara en minúsculas, sin acentos)
const MAPA: { claves: string[]; color: string }[] = [
  { claves: ['activo', 'activa', 'vendid', 'aceptad', 'vigente', 'atendid', 'aprobad', 'pagad', 'firmad', 'cliente', 'exitos', 'enviad', 'entregad', 'si'], color: VERDE },
  { claves: ['inactivo', 'inactiva', 'rechazad', 'cancelad', 'descartad', 'anulad', 'vencid', 'fallid', 'error', 'no'], color: ROJO },
  { claves: ['pendiente', 'nueva', 'nuevo', 'borrador', 'reservad', 'prospecto', 'en atencion', 'en proceso', 'en curso', 'espera', 'revision'], color: NARANJA },
  { claves: ['alquilad', 'arrendad', 'rentad'], color: MORADO },
  { claves: ['disponible', 'finalizad', 'admin', 'completad', 'cerrad'], color: AZUL },
]

function normalizar(v: string): string {
  return (v || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Devuelve el estilo intenso + texto blanco para cualquier estado/situación.
export function estadoBadgeStyle(estado: string): EstadoBadgeStyle {
  const n = normalizar(estado)
  let color = GRIS
  for (const grupo of MAPA) {
    if (grupo.claves.some((c) => n.includes(c))) {
      color = grupo.color
      break
    }
  }
  return {
    background: color,
    color: '#ffffff',
    border: 'none',
    fontWeight: 700,
  }
}
