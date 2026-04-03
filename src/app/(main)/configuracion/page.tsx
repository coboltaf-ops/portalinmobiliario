'use client'

import { useState } from 'react'
import { useConfigStore, type RefItem, type MonedaItem } from '@/features/configuracion/store/configuracion-store'

const inputSt: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }

type TableKey = 'tiposPropiedad' | 'monedas' | 'zonas' | 'ciudades' | 'paises' | 'situacionesPropiedad' | 'tiposIdentificacion' | 'origenesSolicitud'

const tables: { key: TableKey; label: string; hasSymbol?: boolean }[] = [
  { key: 'tiposPropiedad', label: 'Tipo Propiedad' },
  { key: 'monedas', label: 'Tipo Moneda', hasSymbol: true },
  { key: 'zonas', label: 'Zona' },
  { key: 'ciudades', label: 'Ciudad' },
  { key: 'paises', label: 'Pais' },
  { key: 'situacionesPropiedad', label: 'Situacion Propiedad' },
  { key: 'tiposIdentificacion', label: 'Tipo Identificacion' },
  { key: 'origenesSolicitud', label: 'Origenes Solicitud' },
]

export default function ConfiguracionPage() {
  const config = useConfigStore()
  const [activeTable, setActiveTable] = useState<TableKey>('tiposPropiedad')
  const [nombre, setNombre] = useState('')
  const [simbolo, setSimbolo] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const currentTable = tables.find(t => t.key === activeTable)!
  const items = config[activeTable] as (RefItem | MonedaItem)[]

  const handleSave = () => {
    setError('')
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return }
    const dup = items.some(i => i.id !== editId && i.nombre.toLowerCase() === nombre.trim().toLowerCase())
    if (dup) { setError('Ya existe un registro con ese nombre.'); return }
    if (editId) {
      const update: Partial<RefItem | MonedaItem> = { nombre: nombre.trim() }
      if (currentTable.hasSymbol) (update as Partial<MonedaItem>).simbolo = simbolo.trim()
      config.updateItem(activeTable, editId, update)
    } else {
      const newItem: RefItem | MonedaItem = currentTable.hasSymbol
        ? { id: crypto.randomUUID(), nombre: nombre.trim(), simbolo: simbolo.trim() }
        : { id: crypto.randomUUID(), nombre: nombre.trim() }
      config.addItem(activeTable, newItem)
    }
    setNombre(''); setSimbolo(''); setEditId(null)
  }

  const handleEdit = (item: RefItem | MonedaItem) => { setEditId(item.id); setNombre(item.nombre); setSimbolo('simbolo' in item ? item.simbolo : '') }
  const handleDelete = (id: string) => { if (confirm('¿Eliminar este registro?')) config.deleteItem(activeTable, id) }
  const handleCancel = () => { setEditId(null); setNombre(''); setSimbolo(''); setError('') }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Tablas de Referencia</h1>
      <div className="flex gap-6">
        <div className="w-56 shrink-0 space-y-1">
          {tables.map(t => (
            <button key={t.key} onClick={() => { setActiveTable(t.key); handleCancel() }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTable === t.key ? 'text-white bg-white/15 border border-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 className="text-lg font-bold text-white mb-4">{currentTable.label}</h2>
            {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>{error}</div>}
            <div className="flex gap-2 mb-6">
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder={`Nombre de ${currentTable.label}...`} className="flex-1 rounded-lg px-4 py-2 text-sm outline-none" style={inputSt} onKeyDown={e => e.key === 'Enter' && handleSave()} />
              {currentTable.hasSymbol && (
                <input value={simbolo} onChange={e => setSimbolo(e.target.value)} placeholder="Simbolo" className="w-24 rounded-lg px-3 py-2 text-sm outline-none" style={inputSt} />
              )}
              <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.8), rgba(59,130,246,0.6))', border: '1px solid rgba(30,64,175,0.5)' }}>
                {editId ? 'Actualizar' : 'Agregar'}
              </button>
              {editId && <button onClick={handleCancel} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Cancelar</button>}
            </div>
            <div className="space-y-1">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white">{item.nombre}</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
