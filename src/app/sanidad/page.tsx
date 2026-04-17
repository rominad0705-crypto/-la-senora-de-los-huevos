'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mortality } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { Plus, Trash2 } from 'lucide-react'

export default function SanidadPage() {
  const [records, setRecords] = useState<Mortality[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
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

  async function handleSave() {
    await supabase.from('mortality').insert(form)
    setModalOpen(false)
    setForm({ date: new Date().toISOString().split('T')[0], quantity: 1, cause: '', notes: '' })
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este registro?')) return
    await supabase.from('mortality').delete().eq('id', id)
    loadData()
  }

  const totalDead = records.reduce((sum, r) => sum + r.quantity, 0)

  return (
    <div>
      <PageHeader
        title="Sanidad"
        description={`${totalDead} bajas registradas en total`}
        action={
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Registrar Baja
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
                <th className="text-center px-4 py-3 font-medium">Cantidad</th>
                <th className="text-left px-4 py-3 font-medium">Causa</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Notas</th>
                <th className="text-right px-4 py-3 font-medium">Acc.</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(r.date + 'T00:00:00').toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-center font-bold text-red-600">{r.quantity}</td>
                  <td className="px-4 py-3">{r.cause || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{r.notes || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No hay registros de mortalidad</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Baja">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input type="number" min={1} value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Causa</label>
            <input type="text" value={form.cause} onChange={e => setForm({ ...form, cause: e.target.value })}
              placeholder="Ej: depredador, enfermedad, calor..."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button onClick={handleSave}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium">
            Registrar Baja
          </button>
        </div>
      </Modal>
    </div>
  )
}
