'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, ShoppingCart, DollarSign, Egg, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalClients: number
  pendingOrders: number
  deliveredUnpaid: number
  todayProduction: number
  monthIncome: number
  monthExpenses: number
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    pendingOrders: 0,
    deliveredUnpaid: 0,
    todayProduction: 0,
    monthIncome: 0,
    monthExpenses: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const now = new Date()
      const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const today = now.toISOString().split('T')[0]

      const [clients, pending, delivered, production, paidOrders, expenses] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pendiente'),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'entregado'),
        supabase.from('daily_production').select('total_eggs').eq('date', today).single(),
        supabase.from('orders').select('total').eq('status', 'pagado').gte('date', firstOfMonth),
        supabase.from('expenses').select('amount').gte('date', firstOfMonth),
      ])

      const monthIncome = (paidOrders.data || []).reduce((sum, o) => sum + Number(o.total), 0)
      const monthExp = (expenses.data || []).reduce((sum, e) => sum + Number(e.amount), 0)

      setStats({
        totalClients: clients.count || 0,
        pendingOrders: pending.count || 0,
        deliveredUnpaid: delivered.count || 0,
        todayProduction: production.data?.total_eggs || 0,
        monthIncome: monthIncome,
        monthExpenses: monthExp,
      })
      setLoading(false)
    }
    loadStats()
  }, [])

  const cards = [
    { label: 'Clientes', value: stats.totalClients, icon: Users, color: 'bg-blue-500', href: '/clientes' },
    { label: 'Pedidos Pendientes', value: stats.pendingOrders, icon: Clock, color: 'bg-yellow-500', href: '/pedidos' },
    { label: 'Entregados sin cobrar', value: stats.deliveredUnpaid, icon: AlertTriangle, color: 'bg-red-500', href: '/pedidos' },
    { label: 'Postura Hoy', value: stats.todayProduction, icon: Egg, color: 'bg-amber-500', href: '/postura' },
    { label: 'Ingresos del Mes', value: `$${stats.monthIncome.toLocaleString('es-AR')}`, icon: CheckCircle, color: 'bg-green-500', href: '/dashboard' },
    { label: 'Gastos del Mes', value: `$${stats.monthExpenses.toLocaleString('es-AR')}`, icon: DollarSign, color: 'bg-orange-500', href: '/gastos' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">La Señora de los Huevos</h1>
        <p className="text-gray-500 mt-1">Panel de control</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
