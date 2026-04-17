'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'

const emptyProduct = { name: '', description: '', unit_size: 30, price_particular: 0, price_negocio: 0 as number | null, active: true }

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').order('name')
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { loadProducts() }, [])

  function openNew() {
    setEditing(null)
    setForm(emptyProduct)
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, description: p.description, unit_size: p.unit_size, price_particular: p.price_particular, price_negocio: p.price_negocio, active: p.active })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) return alert('El nombre es obligatorio')
    setSaving(true)
    try {
      const data = { ...form, price_negocio: form.price_negocio || null }
      let error
      if (editing) {
        const res = await supabase.from('products').update(data).eq('id', editing.id)
        error = res.error
      } else {
        const res = await supabase.from('products').insert(data)
        error = res.error
      }
      if (error) {
        alert('Error al guardar: ' + error.message)
        setSaving(false)
        return
      }
      setShowForm(false)
      setEditing(null)
      loadProducts()
    } catch (err: any) {
      alert('Error de conexión: ' + (err?.message || 'Revisá tu internet'))
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  if (showForm) {
    return (
      <div>
        <button onClick={() => { setShowForm(false); setEditing(null) }} className="flex items-center gap-2 text-amber-700 mb-4">
          <ArrowLeft size={18} /> Volver
        </button>
        <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidades por envase</label>
            <input type="number" value={form.unit_size} onChange={e => setForm({ ...form, unit_size: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Particular *</label>
            <input type="number" value={form.price_particular} onChange={e => setForm({ ...form, price_particular: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Negocio (0 si no aplica)</label>
            <input type="number" value={form.price_negocio || 0} onChange={e => setForm({ ...form, price_negocio: Number(e.target.value) || null })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium text-base disabled:opacity-50">
            {saving ? 'Guardando...' : editing ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </div>
    )
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
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  {p.description && <p className="text-sm text-gray-500">{p.description}</p>}
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-500">Particular: </span>
                      <span className="font-bold text-amber-700">${p.price_particular.toLocaleString('es-AR')}</span>
                    </p>
                    {p.price_negocio && (
                      <p className="text-sm">
                        <span className="text-gray-500">Negocio: </span>
                        <span className="font-bold text-purple-700">${p.price_negocio.toLocaleString('es-AR')}</span>
                      </p>
                    )}
                    <p className="text-sm text-gray-500">{p.unit_size} huevos</p>
                  </div>
                </div>
                <div className="flex gap-3 ml-2">
                  <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-amber-600">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
