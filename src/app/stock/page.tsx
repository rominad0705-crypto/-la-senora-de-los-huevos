'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StockEntry } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import { Plus, ArrowLeft, Pencil, Trash2 } from 'lucide-react'

export default function StockPage() {
  const [records, setRecords] = useState<StockEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<StockEntry | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    medium_stock: 0,
    large_stock: 0,
    xl_stock: 0,
    notes: '',
  })

  async function loadData() {
    const { data } = await supabase.from('stock').select('*').order('date', { ascending: false }).limit(30)
    setRecords(data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function openNew() {
    setEditing(null)
    setForm({ date: new Date().toISOString().split('T')[0], medium_stock: 0, large_stock: 0, xl_stock: 0, notes: '' })
    setShowForm(true)
  }

  function openEdit(r: StockEntry) {
    setEditing(r)
    setForm({ date: r.date, medium_stock: r.medium_stock, large_stock: r.large_stock, xl_stock: r.xl_stock, notes: r.notes })
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      let error
      if (editing) {
        const res = await supabase.from('stock').update({
          medium_stock: form.medium_stock,
          large_stock: form.large_stock,
          xl_stock: form.xl_stock,
          notes: form.notes,
        }).eq('id', editing.id)
        error = res.error
      } else {
        const res = await supabase.from('stock').insert(form)
        error = res.error
      }
      if (error) {
        alert('Error al guardar: ' + error.message)
        setSaving(false)
        return
      }
      setShowForm(false)
      setEditing(null)
      loadData()
    } catch (err: any) {
      alert('Error de conexión: ' + (err?.message || 'Revisá tu internet'))
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este registro?')) return
    await supabase.from('stock').delete().eq('id', id)
    loadData()
  }

  const latest = records[0]

  if (showForm) {
    return (
      <div>
        <button onClick={() => { setShowForm(false); setEditing(null) }} className="flex items-center gap-2 text-amber-700 mb-4">
          <ArrowLeft size={18} /> Volver
        </button>
        <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Stock' : 'Actualizar Stock'}</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              disabled={!!editing}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medianos</label>
              <input type="number" min={0} value={form.medium_stock}
                onChange={e => setForm({ ...form, medium_stock: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grandes</label>
              <input type="number" min={0} value={form.large_stock}
                onChange={e => setForm({ ...form, large_stock: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">XG</label>
              <input type="number" min={0} value={form.xl_stock}
                onChange={e => setForm({ ...form, xl_stock: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium text-base disabled:opacity-50">
            {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Guardar Stock'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Stock"
        description="Control de huevos disponibles"
        action={
          <button onClick={openNew} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Actualizar Stock
          </button>
        }
      />

      {latest && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-xs text-gray-500">Medianos</p>
            <p className="text-2xl font-bold text-amber-700">{latest.medium_stock}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-xs text-gray-500">Grandes</p>
            <p className="text-2xl font-bold text-amber-700">{latest.large_stock}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
            <p className="text-xs text-gray-500">XG</p>
            <p className="text-2xl font-bold text-amber-700">{latest.xl_stock}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">
                    {new Date(r.date + 'T00:00:00').toLocaleDateString('es-AR')}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Med: {r.medium_stock}</span>
                    <span>Gde: {r.large_stock}</span>
                    <span>XG: {r.xl_stock}</span>
                  </div>
                  {r.notes && <p className="text-sm text-gray-400 mt-1">{r.notes}</p>}
                </div>
                <div className="flex gap-3 ml-2">
                  <button onClick={() => openEdit(r)} className="text-gray-400 hover:text-amber-600">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <div className="text-center py-12 text-gray-400">No hay registros de stock</div>
          )}
        </div>
      )}
    </div>
  )
}
