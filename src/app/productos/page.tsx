'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const emptyProduct = { name: '', description: '', unit_size: 30, price_particular: 0, price_negocio: 0 as number | null, active: true }

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').order('name')
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [])

  function openNew() {
    setEditing(null)
    setForm(emptyProduct)
    setModalOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, description: p.description, unit_size: p.unit_size, price_particular: p.price_particular, price_negocio: p.price_negocio, active: p.active })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    const data = { ...form, price_negocio: form.price_negocio || null }
    if (editing) {
      await supabase.from('products').update(data).eq('id', editing.id)
    } else {
      await supabase.from('products').insert(data)
    }
    setModalOpen(false)
    loadProducts()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Precios y tipos de huevos"
        action={
          <button onClick={openNew} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Nuevo Producto
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-amber-600"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4">{p.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Particular:</span>
                  <span className="font-bold text-amber-700">${p.price_particular.toLocaleString('es-AR')}</span>
                </div>
                {p.price_negocio && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Negocio:</span>
                    <span className="font-bold text-purple-700">${p.price_negocio.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Unidades:</span>
                  <span className="text-gray-700">{p.unit_size} huevos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Producto' : 'Nuevo Producto'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidades</label>
              <input type="number" value={form.unit_size} onChange={e => setForm({ ...form, unit_size: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Particular *</label>
              <input type="number" value={form.price_particular} onChange={e => setForm({ ...form, price_particular: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Negocio (dejar en 0 si no aplica)</label>
            <input type="number" value={form.price_negocio || 0} onChange={e => setForm({ ...form, price_negocio: Number(e.target.value) || null })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>
          <button onClick={handleSave}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium">
            {editing ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
