'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Client, Product, Order, OrderStatus, PaymentMethod } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { Plus, Filter, Trash2, ArrowLeft } from 'lucide-react'

interface OrderItemForm {
  product_id: string
  quantity: number
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [items, setItems] = useState<OrderItemForm[]>([{ product_id: '', quantity: 1 }])

  async function loadData() {
    const [ordersRes, clientsRes, productsRes] = await Promise.all([
      supabase.from('orders').select('*, client:clients(name, type)').order('date', { ascending: false }),
      supabase.from('clients').select('*').order('name'),
      supabase.from('products').select('*').eq('active', true).order('name'),
    ])
    setOrders(ordersRes.data || [])
    setClients(clientsRes.data || [])
    setProducts(productsRes.data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function getPrice(productId: string, clientId: string): number {
    const product = products.find(p => p.id === productId)
    const client = clients.find(c => c.id === clientId)
    if (!product) return 0
    if (client?.type === 'negocio' && product.price_negocio) {
      return product.price_negocio
    }
    return product.price_particular
  }

  function calcTotal(): number {
    return items.reduce((sum, item) => {
      return sum + getPrice(item.product_id, form.client_id) * item.quantity
    }, 0)
  }

  async function handleSave() {
    if (!form.client_id || items.some(i => !i.product_id)) {
      alert('Seleccioná un cliente y al menos un producto')
      return
    }
    setSaving(true)
    try {
      const total = calcTotal()
      const { data: order, error } = await supabase.from('orders').insert({
        client_id: form.client_id,
        date: form.date,
        notes: form.notes,
        total,
        status: 'pendiente',
      }).select().single()

      if (error) {
        alert('Error al guardar: ' + error.message)
        setSaving(false)
        return
      }

      if (order) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: getPrice(item.product_id, form.client_id),
          subtotal: getPrice(item.product_id, form.client_id) * item.quantity,
        }))
        await supabase.from('order_items').insert(orderItems)
      }

      setShowForm(false)
      setForm({ client_id: '', date: new Date().toISOString().split('T')[0], notes: '' })
      setItems([{ product_id: '', quantity: 1 }])
      loadData()
    } catch (err: any) {
      alert('Error de conexión: ' + (err?.message || 'Revisá tu internet'))
    }
    setSaving(false)
  }

  async function updateStatus(orderId: string, status: OrderStatus, paymentMethod?: PaymentMethod) {
    await supabase.from('orders').update({
      status,
      ...(paymentMethod ? { payment_method: paymentMethod } : {}),
    }).eq('id', orderId)
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este pedido?')) return
    await supabase.from('order_items').delete().eq('order_id', id)
    await supabase.from('orders').delete().eq('id', id)
    loadData()
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  if (showForm) {
    return (
      <div>
        <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-amber-700 mb-4">
          <ArrowLeft size={18} /> Volver
        </button>
        <h2 className="text-xl font-bold mb-4">Nuevo Pedido</h2>
        <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500">
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select value={item.product_id} onChange={e => {
                  const newItems = [...items]
                  newItems[idx].product_id = e.target.value
                  setItems(newItems)
                }} className="flex-1 border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500">
                  <option value="">Producto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input type="number" min={1} value={item.quantity} onChange={e => {
                  const newItems = [...items]
                  newItems[idx].quantity = Number(e.target.value)
                  setItems(newItems)
                }} className="w-20 border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" />
                {items.length > 1 && (
                  <button onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 px-2 text-xl">✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setItems([...items, { product_id: '', quantity: 1 }])}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium">+ Agregar producto</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-3 text-base focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>

          <div className="bg-amber-50 rounded-lg p-3 text-right">
            <span className="text-sm text-gray-600">Total: </span>
            <span className="text-xl font-bold text-amber-700">${calcTotal().toLocaleString('es-AR')}</span>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 font-medium text-base disabled:opacity-50">
            {saving ? 'Guardando...' : 'Crear Pedido'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description={`${orders.length} pedidos totales`}
        action={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Nuevo Pedido
          </button>
        }
      />

      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        <Filter size={16} className="text-gray-400 shrink-0" />
        {['all', 'pendiente', 'entregado', 'pagado'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${filterStatus === s ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s === 'all' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{(order as any).client?.name || 'Sin cliente'}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(order.date + 'T00:00:00').toLocaleDateString('es-AR')}
                  </p>
                  <p className="text-lg font-bold text-amber-700 mt-1">
                    ${Number(order.total).toLocaleString('es-AR')}
                  </p>
                  {order.payment_method && (
                    <p className="text-sm text-gray-500">
                      {order.payment_method === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                    </p>
                  )}
                  {order.notes && <p className="text-sm text-gray-400 mt-1">{order.notes}</p>}
                </div>
                <button onClick={() => handleDelete(order.id)} className="text-gray-400 hover:text-red-600 ml-2">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {order.status === 'pendiente' && (
                  <button onClick={() => updateStatus(order.id, 'entregado')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    Marcar Entregado
                  </button>
                )}
                {order.status === 'entregado' && (
                  <>
                    <button onClick={() => updateStatus(order.id, 'pagado', 'efectivo')}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      Pagó Efectivo
                    </button>
                    <button onClick={() => updateStatus(order.id, 'pagado', 'transferencia')}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      Pagó Transfer
                    </button>
                  </>
                )}
                {(order.status === 'entregado' || order.status === 'pagado') && (
                  <button onClick={() => updateStatus(order.id, 'pendiente')}
                    className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                    Volver a Pendiente
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No hay pedidos</div>
          )}
        </div>
      )}
    </div>
  )
}
