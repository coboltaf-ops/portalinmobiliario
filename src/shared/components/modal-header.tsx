interface ModalHeaderProps {
  onClose: () => void
  userName?: string
  userRole?: string
}

export function ModalHeader({ onClose, userName, userRole }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 py-4" style={{ backgroundColor: '#1e3a8a' }}>
      {/* Left: Logo + Text */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: '#001e4d' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        {/* Text */}
        <span className="text-2xl font-bold" style={{ color: '#001e4d' }}>PORTAL INMOBILIARIO</span>
      </div>

      {/* Center/Right: User Info + Exit Button */}
      <div className="flex items-center gap-6">
        {/* User Info */}
        {(userName || userRole) && (
          <div style={{ textAlign: 'right' }}>
            <p className="text-sm font-semibold" style={{ color: '#001e4d', margin: 0 }}>{userName}</p>
            <p className="text-xs" style={{ color: '#001e4d', margin: 0 }}>{userRole}</p>
          </div>
        )}
        {/* Exit Button */}
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ background: '#ef4444', border: '1px solid #dc2626' }}
        >
          SALIR
        </button>
      </div>
    </div>
  )
}
