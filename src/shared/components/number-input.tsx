'use client'

import { useEffect, useState } from 'react'

type Props = {
  value: number
  onValueChange: (n: number) => void
  allowDecimals?: boolean
  className?: string
  style?: React.CSSProperties
  placeholder?: string
  min?: number
}

// Deja solo dígitos (y un punto decimal opcional).
function clean(s: string, allowDecimals: boolean): string {
  s = s.replace(/[^\d.]/g, '')
  if (!allowDecimals) return s.replace(/\./g, '')
  const i = s.indexOf('.')
  if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '')
  return s
}

// Agrupa la parte entera con separadores de miles (1,234,567.89).
function group(s: string): string {
  if (s === '') return ''
  const [intp, decp] = s.split('.')
  const intFmt = (intp.replace(/^0+(?=\d)/, '') || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decp !== undefined ? `${intFmt}.${decp}` : intFmt
}

/**
 * Input numérico que muestra separadores de miles mientras se escribe.
 * Mantiene el valor real como number a través de onValueChange.
 */
export function NumberInput({ value, onValueChange, allowDecimals = true, className, style, placeholder, min }: Props) {
  const [text, setText] = useState<string>(() => (value ? group(String(value)) : ''))
  const [focused, setFocused] = useState(false)

  // Sincroniza desde el valor externo cuando el campo no está enfocado
  // (reset del formulario, precarga al editar, autocompletado, etc.).
  useEffect(() => {
    if (!focused) setText(value ? group(String(value)) : '')
  }, [value, focused])

  return (
    <input
      type="text"
      inputMode={allowDecimals ? 'decimal' : 'numeric'}
      value={text}
      placeholder={placeholder}
      className={className}
      style={style}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false)
        setText(value ? group(String(value)) : '')
      }}
      onChange={e => {
        const cleaned = clean(e.target.value, allowDecimals)
        setText(group(cleaned))
        const num = parseFloat(cleaned)
        const safe = isNaN(num) ? 0 : num
        onValueChange(min !== undefined && safe < min ? min : safe)
      }}
    />
  )
}
