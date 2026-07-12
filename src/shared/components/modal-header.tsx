interface ModalHeaderProps {
  onClose: () => void
}

export function ModalHeader({ onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between px-6 py-4" style={{ backgroundColor: '#001e4d', borderBottom: '2px solid #001e4d' }}>
      <div className="flex flex-col items-start gap-2">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: '#001e4d', border: '1px solid rgba(255,255,255,0.2)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span className="text-lg font-bold" style={{ color: '#ffffff' }}>Portal Inmobiliario</span>
      </div>
      <button
        onClick={onClose}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
        style={{ background: '#ef4444', border: '1px solid #dc2626' }}
      >
        Salir
      </button>
    </div>
  )
}
