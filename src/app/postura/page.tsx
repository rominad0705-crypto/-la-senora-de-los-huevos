'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { DailyProduction } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import { Plus, Egg } from 'lucide-react'
import Modal from '@/components/Modal'

export default function PosturaPage() {
  const [records, setRecords] = useState<DailyProduction[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
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

  async function handleSave() {
    await supabase.from('daily_production').upsert({
      date: form.date,
      medium_eggs: form.medium_eggs,
      large_eggs: form.large_eggs,
      xl_eggs: form.xl_eggs,
      notes: form.notes,
    }, { onConflict: 'date' })
    setModalOpen(false)
    setForm({ date: new Date().toISOString().split('T')[0], medium_eggs: 0, large_eggs: 0, xl_eggs: 0, notes: '' })
    loadData()
  }

  const avgTotal = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + r.total_eggs, 0) / records.length)
    : 0

  return (
    <div>
      <PageHeader
        title="Postura Diaria"
        description={`Promedio últimos 30 días: ${avgTotal} huevos/día`}
        action={
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Cargar Postura
          </button>
        }
      />

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
                <th className="text-center px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(r.date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-center">{r.medium_eggs}</td>
                  <td className="px-4 py-3 text-center">{r.large_eggs}</td>
                  <td className="px-4 py-3 text-center">{r.xl_eggs}</td>
                  <td className="px-4 py-3 text-center font-bold text-amber-700">{r.total_eggs}</td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{r.notes}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay registros de postura</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Cargar Postura Diaria">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medianos</label>
              <input type="number" min={0} value={form.medium_eggs} onChange={e => setForm({ ...form, medium_eggs: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grandes</label>
              <input type="number" min={0} value={form.large_eggs} onChange={e => setForm({ ...form, large_eggs: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">XG</label>
              <input type="number" min={0} value={form.xl_eggs} onChange={e => setForm({ ...form, xl_eggs: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <Egg className="inline mr-2 text-amber-600" size={18} />
            <span className="font-bold text-amber-700">Total: {form.medium_eggs + form.large_eggs + form.xl_eggs} huevos</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button onClick={handleSave}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium">
            Guardar Postura
          </button>
        </div>
      </Modal>
    </div>
  )
}
