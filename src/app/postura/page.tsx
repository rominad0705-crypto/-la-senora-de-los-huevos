'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DailyProduction } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import { Plus, Egg, ArrowLeft, Pencil, Trash2 } from 'lucide-react'

export default function PosturaPage() {
  const [records, setRecords] = useState<DailyProduction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DailyProduction | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    medium_eggs: 0,
    large_eggs: 0,
    xl_eggs: 0,
    notes: '',
  })

  async function loadData() {
    const { data } = await supabase.from('daily_production').select('*').order('date', { ascending: false }).limit(30)
    setRecords(data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function openNew() {
    setEditing(null)
    setForm({ date: new Date().toISOString().split('T')[0], medium_eggs: 0, large_eggs: 0, xl_eggs: 0, notes: '' })
    setShowForm(true)
  }

  function openEdit(r: DailyProduction) {
    setEditing(r)
    setForm({ date: r.date, medium_eggs: r.medium_eggs, large_eggs: r.large_eggs, xl_eggs: r.xl_eggs, notes: r.notes })
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      let error
      if (editing) {
        const res = await supabase.from('daily_production').update({
          medium_eggs: form.medium_eggs,
          large_eggs: form.large_eggs,
          xl_eggs: form.xl_eggs,
          notes: form.notes,
        }).eq('id', editing.id)
        error = res.error
      } else {
        const res = await supabase.from('daily_production').upsert({
          date: form.date,
          medium_eggs: form.medium_eggs,
          large_eggs: form.large_eggs,
          xl_eggs: form.xl_eggs,
          notes: form.notes,
        }, { onConflict: 'date' })
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
    await supabase.from('daily_production').delete().eq('id', id)
    loadData()
  }

  const avgTotal = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.total_eggs, 0) / records.length)
    : 0

  if (showForm) {
    return (
      <div>
        <button onClick={() => { setShowForm(false); setEditing(null) }} className="flex items-center gap-2 text-amber-700 mb-4">
          <ArrowLeft size={18} /> Volver
        </button>
        <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Postura' : 'Cargar Postura Diaria'}</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.date} disabled={!!editing}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medianos</label>
              <input type="number" min={0} value={form.medium_eggs}
                onChange={e => setForm({ ...form, medium_eggs: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grandes</label>
              <input type="number" min={0} value={form.large_eggs}
                onChange={e => setForm({ ...form, large_eggs: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">XG</label>
              <input type="number" min={0} value={form.xl_eggs}
                onChange={e => setForm({ ...form, xl_eggs: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <Egg className="inline mr-2 text-amber-600" size={18} />
            <span className="font-bold text-amber-700">Total: {form.medium_eggs + form.large_eggs + form.xl_eggs} huevos</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium text-base disabled:opacity-50">
            {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Guardar Postura'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Postura Diaria"
        description={`Promedio últimos 30 días: ${avgTotal} huevos/día`}
        action={
          <button onClick={openNew} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Cargar Postura
          </button>
        }
      />

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
                    <span>Med: {r.medium_eggs}</span>
                    <span>Gde: {r.large_eggs}</span>
                    <span>XG: {r.xl_eggs}</span>
                    <span className="font-bold text-amber-700">Total: {r.total_eggs}</span>
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
            <div className="text-center py-12 text-gray-400">No hay registros de postura</div>
          )}
        </div>
      )}
    </div>
  )
}
