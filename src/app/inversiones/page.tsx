'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Investment } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import { Plus, Trash2, Pencil, ArrowLeft } from 'lucide-react'

const categories = ['Gallinas', 'Infraestructura', 'Equipamiento', 'Vehículo', 'Otro']

export default function InversionesPage() {
  const [records, setRecords] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Investment | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Gallinas',
    description: '',
    amount: 0,
    notes: '',
  })

  async function loadData() {
    const { data } = await supabase.from('investments').select('*').order('date', { ascending: false })
    setRecords(data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function openNew() {
    setEditing(null)
    setForm({ date: new Date().toISOString().split('T')[0], category: 'Gallinas', description: '', amount: 0, notes: '' })
    setShowForm(true)
  }

  function openEdit(r: Investment) {
    setEditing(r)
    setForm({ date: r.date, category: r.category, description: r.description, amount: Number(r.amount), notes: r.notes })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.amount) return alert('El monto es obligatorio')
    setSaving(true)
    try {
      let error
      if (editing) {
        const res = await supabase.from('investments').update(form).eq('id', editing.id)
        error = res.error
      } else {
        const res = await supabase.from('investments').insert(form)
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
    if (!confirm('¿Eliminar esta inversión?')) return
    await supabase.from('investments').delete().eq('id', id)
    loadData()
  }

  const totalInvested = records.reduce((sum, r) => sum + Number(r.amount), 0)

  if (showForm) {
    return (
      <div>
        <button onClick={() => { setShowForm(false); setEditing(null) }} className="flex items-center gap-2 text-amber-700 mb-4">
          <ArrowLeft size={18} /> Volver
        </button>
        <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Inversión' : 'Nueva Inversión'}</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
            <input type="number" min={0} value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium text-base disabled:opacity-50">
            {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Registrar Inversión'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Inversiones"
        description={`Total invertido: $${totalInvested.toLocaleString('es-AR')}`}
        action={
          <button onClick={openNew} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Nueva Inversión
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
                  <p className="font-semibold text-gray-900">
                    {new Date(r.date + 'T00:00:00').toLocaleDateString('es-AR')}
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium mt-1">
                    {r.category}
                  </span>
                  <p className="text-lg font-bold text-indigo-700 mt-1">${Number(r.amount).toLocaleString('es-AR')}</p>
                  {r.description && <p className="text-sm text-gray-600">{r.description}</p>}
                  {r.notes && <p className="text-sm text-gray-400">{r.notes}</p>}
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
            <div className="text-center py-12 text-gray-400">No hay inversiones registradas</div>
          )}
        </div>
      )}
    </div>
  )
}
