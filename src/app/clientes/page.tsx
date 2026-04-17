'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Client, ClientType } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

const emptyClient = { name: '', phone: '', address: '', zone: '', type: 'particular' as ClientType, notes: '' }

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyClient)

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').order('name')
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => { loadClients() }, [])

  function openNew() {
    setEditing(null)
    setForm(emptyClient)
    setModalOpen(true)
  }

  function openEdit(client: Client) {
    setEditing(client)
    setForm({ name: client.name, phone: client.phone, address: client.address, zone: client.zone, type: client.type, notes: client.notes })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return alert('El nombre es obligatorio')
    let error
    if (editing) {
      const res = await supabase.from('clients').update(form).eq('id', editing.id)
      error = res.error
    } else {
      const res = await supabase.from('clients').insert(form)
      error = res.error
    }
    if (error) {
      alert('Error al guardar: ' + error.message)
      return
    }
    setModalOpen(false)
    loadClients()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este cliente?')) return
    await supabase.from('clients').delete().eq('id', id)
    loadClients()
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.zone.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${clients.length} clientes registrados`}
        action={
          <button onClick={openNew} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
            <Plus size={18} /> Nuevo Cliente
          </button>
        }
      />

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o zona..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Teléfono</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Zona</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{client.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${client.type === 'negocio' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {client.type === 'negocio' ? 'Negocio' : 'Particular'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">{client.phone}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{client.zone}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(client)} className="text-gray-400 hover:text-amber-600">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(client.id)} className="text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No se encontraron clientes</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as ClientType })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500">
              <option value="particular">Particular</option>
              <option value="negocio">Negocio</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
            <input type="text" value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>
          <button onClick={handleSave}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium">
            {editing ? 'Guardar Cambios' : 'Crear Cliente'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
