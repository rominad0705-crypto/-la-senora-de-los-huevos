'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StockEntry } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { Plus } from 'lucide-react'

export default function StockPage() {
  const [records, setRecords] = useState<StockEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
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

  async function handleSave() {
    await supabase.from('stock').insert(form)
    setModalOpen(false)
    setForm({ date: new Date().toISOString().split('T')[0], medium_stock: 0, large_stock: 0, xl_stock: 0, notes: '' })
    loadData()
  }

  const latest = records[0]

  return (
    <div>
      <PageHeader
        title="Stock"
        description="Control de huevos disponibles"
        action={
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Actualizar Stock
          </button>
        }
      />

      {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className="text-sm text-gray-500">Medianos</p>
            <p className="text-3xl font-bold text-amber-700">{latest.medium_stock}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className="text-sm text-gray-500">Grandes</p>
            <p className="text-3xl font-bold text-amber-700">{latest.large_stock}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className="text-sm text-gray-500">Extra Grandes</p>
            <p className="text-3xl font-bold text-amber-700">{latest.xl_stock}</p>
          </div>
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
                <th className="text-center px-4 py-3 font-medium">Medianos</th>
                <th className="text-center px-4 py-3 font-medium">Grandes</th>
                <th className="text-center px-4 py-3 font-medium">XG</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(r.date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-center">{r.medium_stock}</td>
                  <td className="px-4 py-3 text-center">{r.large_stock}</td>
                  <td className="px-4 py-3 text-center">{r.xl_stock}</td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{r.notes}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No hay registros de stock</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Actualizar Stock">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medianos</label>
              <input type="number" min={0} value={form.medium_stock} onChange={e => setForm({ ...form, medium_stock: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grandes</label>
              <input type="number" min={0} value={form.large_stock} onChange={e => setForm({ ...form, large_stock: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">XG</label>
              <input type="number" min={0} value={form.xl_stock} onChange={e => setForm({ ...form, xl_stock: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button onClick={handleSave}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium">
            Guardar Stock
          </button>
        </div>
      </Modal>
    </div>
  )
}
