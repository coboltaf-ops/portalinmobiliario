'use client'

import { useState } from 'react'
import { useConfigStore, type RefItem, type MonedaItem, type CiudadItem } from '@/features/configuracion/store/configuracion-store'

const inputSt: React.CSSProperties = { background: '#ffffff', border: '2px solid #000000', color: '#000000' }

type SimpleTableKey = 'tiposPropiedad' | 'monedas' | 'paises' | 'situacionesPropiedad' | 'tiposIdentificacion' | 'origenesSolicitud'

const simpleTables: { key: SimpleTableKey; label: string; hasSymbol?: boolean }[] = [
  { key: 'tiposPropiedad', label: 'Tipo Propiedad' },
  { key: 'monedas', label: 'Tipo Moneda', hasSymbol: true },
  { key: 'paises', label: 'Pais' },
  { key: 'situacionesPropiedad', label: 'Situacion Propiedad' },
  { key: 'tiposIdentificacion', label: 'Tipo Identificacion' },
  { key: 'origenesSolicitud', label: 'Origenes Solicitud' },
]

type ActiveTab = SimpleTableKey | 'ciudades'

export default function ConfiguracionPage() {
  const config = useConfigStore()
  const [activeTable, setActiveTable] = useState<ActiveTab>('tiposPropiedad')
  const [nombre, setNombre] = useState('')
  const [simbolo, setSimbolo] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [ciudadNombre, setCiudadNombre] = useState('')
  const [editCiudadId, setEditCiudadId] = useState<string | null>(null)
  const [expandedCiudad, setExpandedCiudad] = useState<string | null>(null)
  const [zonaNombre, setZonaNombre] = useState('')
  const [editZonaId, setEditZonaId] = useState<string | null>(null)

  const isSimple = activeTable !== 'ciudades'
  const currentSimple = simpleTables.find(t => t.key === activeTable)
  const items = isSimple ? (config[activeTable as SimpleTableKey] as (RefItem | MonedaItem)[]) : []

  const handleCancel = () => { setEditId(null); setNombre(''); setSimbolo(''); setError(''); setEditCiudadId(null); setCiudadNombre(''); setEditZonaId(null); setZonaNombre('') }

  const handleSave = () => {
    setError('')
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    const dup = items.some(i => i.id !== editId && i.nombre.toLowerCase() === nombre.trim().toLowerCase())
    if (dup) { setError('Ya existe un registro con ese nombre.'); return }
    if (editId) {
      const update: Partial<RefItem | MonedaItem> = { nombre: nombre.trim() }
      if (currentSimple?.hasSymbol) (update as Partial<MonedaItem>).simbolo = simbolo.trim()
      config.updateItem(activeTable, editId, update)
    } else {
      const newItem: RefItem | MonedaItem = currentSimple?.hasSymbol
        ? { id: crypto.randomUUID(), nombre: nombre.trim(), simbolo: simbolo.trim() }
        : { id: crypto.randomUUID(), nombre: nombre.trim() }
      config.addItem(activeTable, newItem)
    }
    setNombre(''); setSimbolo(''); setEditId(null)
  }

  const handleEdit = (item: RefItem | MonedaItem) => { setEditId(item.id); setNombre(item.nombre); setSimbolo('simbolo' in item ? item.simbolo : '') }
  const handleDelete = (id: string) => { if (confirm('¿Eliminar este registro?')) config.deleteItem(activeTable, id) }

  const handleSaveCiudad = () => {
    setError('')
    if (!ciudadNombre.trim()) { setError('El nombre es obligatorio.'); return }
    if (editCiudadId) { config.updateCiudad(editCiudadId, ciudadNombre.trim()) }
    else { config.addCiudad({ id: crypto.randomUUID(), nombre: ciudadNombre.trim(), zonas: [] }) }
    setCiudadNombre(''); setEditCiudadId(null)
  }

  const handleSaveZona = (ciudadId: string) => {
    setError('')
    if (!zonaNombre.trim()) { setError('El nombre de la zona es obligatorio.'); return }
    if (editZonaId) { config.updateZonaInCiudad(ciudadId, editZonaId, zonaNombre.trim()) }
    else { config.addZonaToCiudad(ciudadId, { id: crypto.randomUUID(), nombre: zonaNombre.trim() }) }
    setZonaNombre(''); setEditZonaId(null)
  }

  const allTabs = [...simpleTables.map(t => ({ key: t.key as ActiveTab, label: t.label })), { key: 'ciudades' as ActiveTab, label: 'Ciudad' }]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Tablas Referencia</h1>
      <div className="flex flex-wrap gap-2">
        {allTabs.map(t => (
          <button key={t.key} onClick={() => { setActiveTable(t.key); handleCancel() }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ background: activeTable === t.key ? 'rgba(30,64,175,0.3)' : 'transparent', border: activeTable === t.key ? '1px solid rgba(30,64,175,0.5)' : '1px solid rgba(255,255,255,0.1)', color: activeTable === t.key ? '#3b82f6' : 'rgba(255,255,255,0.5)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>{error}</div>}

        {isSimple && currentSimple && (
          <>
            <h2 className="text-lg font-semibold text-white mb-4">{currentSimple.label}</h2>
            <div className="flex items-end gap-3 mb-6">
              <div className="flex-1"><input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} placeholder={`Nombre...`} onKeyDown={e => e.key === 'Enter' && handleSave()} /></div>
              {currentSimple.hasSymbol && <div className="w-32"><input value={simbolo} onChange={e => setSimbolo(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} placeholder="Simbolo" /></div>}
              <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>{editId ? 'Actualizar' : 'Agregar'}</button>
              {editId && <button onClick={handleCancel} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Cancelar</button>}
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm">{item.nombre}</span>
                    {'simbolo' in item && <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(30,64,175,0.2)', color: '#3b82f6' }}>{(item as MonedaItem).simbolo}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-white/10"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-center text-white/30 py-4">No hay registros</p>}
            </div>
          </>
        )}

        {activeTable === 'ciudades' && (
          <>
            <h2 className="text-lg font-semibold text-white mb-4">Ciudad y Zonas</h2>
            <div className="flex items-end gap-3 mb-6">
              <div className="flex-1"><input value={ciudadNombre} onChange={e => setCiudadNombre(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} placeholder="Nueva ciudad o poblacion" onKeyDown={e => e.key === 'Enter' && handleSaveCiudad()} /></div>
              <button onClick={handleSaveCiudad} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>{editCiudadId ? 'Actualizar' : 'Agregar'}</button>
              {editCiudadId && <button onClick={() => { setEditCiudadId(null); setCiudadNombre('') }} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Cancelar</button>}
            </div>
            <div className="space-y-3">
              {config.ciudades.map((ciudad: CiudadItem) => {
                const isExpanded = expandedCiudad === ciudad.id
                return (
                  <div key={ciudad.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)' }} onClick={() => setExpandedCiudad(isExpanded ? null : ciudad.id)}>
                      <div className="flex items-center gap-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}><path d="M9 18l6-6-6-6"/></svg>
                        <span className="text-white font-medium text-sm">{ciudad.nombre}</span>
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(30,64,175,0.2)', color: '#3b82f6' }}>{(ciudad.zonas || []).length} zonas</span>
                      </div>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setEditCiudadId(ciudad.id); setCiudadNombre(ciudad.nombre) }} className="p-1.5 rounded-lg hover:bg-white/10"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button onClick={() => { if (confirm(`¿Eliminar ${ciudad.nombre} y sus zonas?`)) config.deleteCiudad(ciudad.id) }} className="p-1.5 rounded-lg hover:bg-white/10"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 py-3 space-y-2" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-end gap-2 mb-3">
                          <div className="flex-1"><input value={expandedCiudad === ciudad.id ? zonaNombre : ''} onChange={e => setZonaNombre(e.target.value)} className="w-full rounded-lg px-3 py-1.5 text-sm outline-none" style={inputSt} placeholder="Nombre de zona" onKeyDown={e => e.key === 'Enter' && handleSaveZona(ciudad.id)} /></div>
                          <button onClick={() => handleSaveZona(ciudad.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'rgba(30,64,175,0.6)', border: '1px solid rgba(30,64,175,0.4)' }}>{editZonaId ? 'Actualizar' : 'Agregar'}</button>
                          {editZonaId && <button onClick={() => { setEditZonaId(null); setZonaNombre('') }} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>Cancelar</button>}
                        </div>
                        {(ciudad.zonas || []).map(zona => (
                          <div key={zona.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <span className="text-white/70 text-sm">{zona.nombre}</span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditZonaId(zona.id); setZonaNombre(zona.nombre) }} className="p-1 rounded hover:bg-white/10"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                              <button onClick={() => { if (confirm('¿Eliminar esta zona?')) config.deleteZonaFromCiudad(ciudad.id, zona.id) }} className="p-1 rounded hover:bg-white/10"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
                            </div>
                          </div>
                        ))}
                        {(ciudad.zonas || []).length === 0 && <p className="text-center text-white/20 py-2 text-xs">Sin zonas configuradas</p>}
                      </div>
                    )}
                  </div>
                )
              })}
              {config.ciudades.length === 0 && <p className="text-center text-white/30 py-4">No hay ciudades/poblaciones</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
