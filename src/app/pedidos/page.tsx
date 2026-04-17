'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Client, Product, Order, OrderStatus, PaymentMethod } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import { Plus, Filter } from 'lucide-react'

interface OrderItemForm {
  product_id: string
  quantity: number
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

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
    if (!form.client_id || items.some(i => !i.product_id)) return

    const total = calcTotal()
    const { data: order } = await supabase.from('orders').insert({
      client_id: form.client_id,
      date: form.date,
      notes: form.notes,
      total,
      status: 'pendiente',
    }).select().single()

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

    setModalOpen(false)
    setForm({ client_id: '', date: new Date().toISOString().split('T')[0], notes: '' })
    setItems([{ product_id: '', quantity: 1 }])
    loadData()
  }

  async function updateStatus(orderId: string, status: OrderStatus, paymentMethod?: PaymentMethod) {
    const update: Record<string, string> = { status }
    if (paymentMethod) update.payment_method = paymentMethod
    await supabase.from('orders').update(update).eq('id', orderId)
    loadData()
  }

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description={`${orders.length} pedidos totales`}
        action={
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
            <Plus size={18} /> Nuevo Pedido
          </button>
        }
      />

      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        <Filter size={16} className="text-gray-400" />
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{(order as any).client?.name || 'Sin cliente'}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.date + 'T00:00:00').toLocaleDateString('es-AR')} — ${Number(order.total).toLocaleString('es-AR')}
                    {order.payment_method && ` — ${order.payment_method === 'efectivo' ? 'Efectivo' : 'Transferencia'}`}
                  </p>
                  {order.notes && <p className="text-sm text-gray-400 mt-1">{order.notes}</p>}
                </div>
                <div className="flex gap-2">
                  {order.status === 'pendiente' && (
                    <button onClick={() => updateStatus(order.id, 'entregado')}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200">
                      Marcar Entregado
                    </button>
                  )}
                  {order.status === 'entregado' && (
                    <>
                      <button onClick={() => updateStatus(order.id, 'pagado', 'efectivo')}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">
                        Pagó Efectivo
                      </button>
                      <button onClick={() => updateStatus(order.id, 'pagado', 'transferencia')}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200">
                        Pagó Transfer
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No hay pedidos</div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Pedido">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500">
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select value={item.product_id} onChange={e => {
                  const newItems = [...items]
                  newItems[idx].product_id = e.target.value
                  setItems(newItems)
                }} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500">
                  <option value="">Producto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input type="number" min={1} value={item.quantity} onChange={e => {
                  const newItems = [...items]
                  newItems[idx].quantity = Number(e.target.value)
                  setItems(newItems)
                }} className="w-20 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500" />
                {items.length > 1 && (
                  <button onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-600 px-2">✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setItems([...items, { product_id: '', quantity: 1 }])}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium">+ Agregar producto</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500" rows={2} />
          </div>

          <div className="bg-amber-50 rounded-lg p-3 text-right">
            <span className="text-sm text-gray-600">Total: </span>
            <span className="text-xl font-bold text-amber-700">${calcTotal().toLocaleString('es-AR')}</span>
          </div>

          <button onClick={handleSave}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium">
            Crear Pedido
          </button>
        </div>
      </Modal>
    </div>
  )
}
