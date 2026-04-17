'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Expense } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { Plus, Trash2 } from 'lucide-react'

const categories = ['Alimento gallinas', 'Combustible', 'Redes sociales', 'Packaging', 'Servicios', 'Mantenimiento', 'Otro']

export default function GastosPage() {
  const [records, setRecords] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Alimento gallinas',
    description: '',
    amount: 0,
    notes: '',
  })

  async function loadData() {
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false })
    setRecords(data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleSave() {
    if (!form.amount) return
    await supabase.from('expenses').insert(form)
    setModalOpen(false)
    setForm({ date: new Date().toISOString().split('T')[0], category: 'Alimento gallinas', description: '', amount: 0, notes: '' })
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este gasto?')) return
    await supabase.from('expenses').delete().eq('id', id)
    loadData()
  }

  const totalExpenses = records.reduce((sum, r) => sum + Number(r.amount), 0)

  // Group by category
  const byCategory = records.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + Number(r.amount)
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <PageHeader
        title="Gastos"
        description={`Total gastado: $${totalExpenses.toLocaleString('es-AR')}`}
        action={
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Nuevo Gasto
          </button>
        }
      />

      {/* Summary by category */}
      {Object.keys(byCategory).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
            <div key={cat} className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-xs text-gray-500">{cat}</p>
              <p className="text-lg font-bold text-orange-600">${amount.toLocaleString('es-AR')}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 font-medium">Categoría</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Descripción</th>
                <th className="text-right px-4 py-3 font-medium">Monto</th>
                <th className="text-right px-4 py-3 font-medium">Acc.</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(r.date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">{r.category}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{r.description || '-'}</td>
                  <td className="px-4 py-3 text-right font-bold">${Number(r.amount).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No hay gastos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Gasto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
            <input type="number" min={0} value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button onClick={handleSave}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium">
            Registrar Gasto
          </button>
        </div>
      </Modal>
    </div>
  )
}
