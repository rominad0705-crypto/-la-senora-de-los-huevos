'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mortality } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import { Plus, Trash2, Pencil, ArrowLeft } from 'lucide-react'

export default function SanidadPage() {
  const [records, setRecords] = useState<Mortality[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Mortality | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    cause: '',
    notes: '',
  })

  async function loadData() {
    const { data } = await supabase.from('mortality').select('*').order('date', { ascending: false })
    setRecords(data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function openNew() {
    setEditing(null)
    setForm({ date: new Date().toISOString().split('T')[0], quantity: 1, cause: '', notes: '' })
    setShowForm(true)
  }

  function openEdit(r: Mortality) {
    setEditing(r)
    setForm({ date: r.date, quantity: r.quantity, cause: r.cause, notes: r.notes })
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      let error
      if (editing) {
        const res = await supabase.from('mortality').update(form).eq('id', editing.id)
        error = res.error
      } else {
        const res = await supabase.from('mortality').insert(form)
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
    await supabase.from('mortality').delete().eq('id', id)
    loadData()
  }

  const totalDead = records.reduce((sum, r) => sum + r.quantity, 0)

  if (showForm) {
    return (
      <div>
        <button onClick={() => { setShowForm(false); setEditing(null) }} className="flex items-center gap-2 text-amber-700 mb-4">
          <ArrowLeft size={18} /> Volver
        </button>
        <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Registro' : 'Registrar Baja'}</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input type="number" min={1} value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Causa</label>
            <input type="text" value={form.cause} onChange={e => setForm({ ...form, cause: e.target.value })}
              placeholder="Ej: depredador, enfermedad, calor..."
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium text-base disabled:opacity-50">
            {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Registrar Baja'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Sanidad"
        description={`${totalDead} bajas registradas en total`}
        action={
          <button onClick={openNew} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Registrar Baja
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
                  <p className="text-sm text-red-600 font-bold">{r.quantity} {r.quantity === 1 ? 'baja' : 'bajas'}</p>
                  {r.cause && <p className="text-sm text-gray-600">Causa: {r.cause}</p>}
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
            <div className="text-center py-12 text-gray-400">No hay registros de mortalidad</div>
          )}
        </div>
      )}
    </div>
  )
}
