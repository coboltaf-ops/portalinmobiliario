interface ModalHeaderProps {
  onClose: () => void
  userName?: string
  userRole?: string
}

export function ModalHeader({ onClose, userName, userRole }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-8 py-4" style={{ background: '#001e4d' }}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#2563eb' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold" style={{color: '#ffffff', margin: 0}}>PORTAL INMOBILIARIO</h1>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold" style={{ color: '#ffffff', margin: 0 }}>{userName}</p>
        <p className="text-sm" style={{ color: '#ffffff', margin: 0 }}>{userRole}</p>
      </div>
    </div>
  )
}
