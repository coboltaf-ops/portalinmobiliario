interface ModalHeaderProps {
  onClose: () => void
}

export function ModalHeader({ onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between px-6 py-4" style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #000000' }}>
      <div className="flex flex-col items-start gap-2">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span className="text-lg font-bold text-black">Portal Inmobiliario</span>
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
