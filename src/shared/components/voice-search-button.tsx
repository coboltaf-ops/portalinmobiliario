'use client'

import { useState, useCallback } from 'react'

interface VoiceSearchButtonProps {
  onResult: (text: string) => void
}

export default function VoiceSearchButton({ onResult }: VoiceSearchButtonProps) {
  const [listening, setListening] = useState(false)

  const startListening = useCallback(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert('Tu navegador no soporta reconocimiento de voz')
      return
    }
    const recognition = new SR() as any
    recognition.lang = 'es-ES'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      onResult(text)
    }

    recognition.start()
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [onResult])

  return (
    <button
      type="button"
      onClick={startListening}
      className="p-2 rounded-lg transition-all"
      style={{
        background: listening ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)',
        border: listening ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.15)',
        color: listening ? '#f87171' : 'rgba(255,255,255,0.6)',
      }}
      title="Busqueda por voz"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  )
}
