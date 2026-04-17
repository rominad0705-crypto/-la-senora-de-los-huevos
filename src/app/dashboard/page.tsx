'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import { TrendingUp, TrendingDown, DollarSign, Egg } from 'lucide-react'

interface MonthData {
  month: string
  income: number
  expenses: number
  profit: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalInvestments, setTotalInvestments] = useState(0)
  const [totalProduction, setTotalProduction] = useState(0)
  const [totalMortality, setTotalMortality] = useState(0)
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([])
  const [pendingAmount, setPendingAmount] = useState(0)

  useEffect(() => {
    async function loadData() {
      const [orders, expenses, investments, production, mortality, pendingOrders] = await Promise.all([
        supabase.from('orders').select('date, total, status'),
        supabase.from('expenses').select('date, amount'),
        supabase.from('investments').select('amount'),
        supabase.from('daily_production').select('total_eggs'),
        supabase.from('mortality').select('quantity'),
        supabase.from('orders').select('total').in('status', ['pendiente', 'entregado']),
      ])

      const paidOrders = (orders.data || []).filter(o => o.status === 'pagado')
      const income = paidOrders.reduce((sum, o) => sum + Number(o.total), 0)
      const exp = (expenses.data || []).reduce((sum, e) => sum + Number(e.amount), 0)
      const inv = (investments.data || []).reduce((sum, i) => sum + Number(i.amount), 0)
      const prod = (production.data || []).reduce((sum, p) => sum + p.total_eggs, 0)
      const mort = (mortality.data || []).reduce((sum, m) => sum + m.quantity, 0)
      const pending = (pendingOrders.data || []).reduce((sum, o) => sum + Number(o.total), 0)

      setTotalIncome(income)
      setTotalExpenses(exp)
      setTotalInvestments(inv)
      setTotalProduction(prod)
      setTotalMortality(mort)
      setPendingAmount(pending)

      // Build monthly breakdown
      const months: Record<string, { income: number; expenses: number }> = {}
      for (const o of paidOrders) {
        const m = o.date.substring(0, 7)
        if (!months[m]) months[m] = { income: 0, expenses: 0 }
        months[m].income += Number(o.total)
      }
      for (const e of (expenses.data || [])) {
        const m = e.date.substring(0, 7)
        if (!months[m]) months[m] = { income: 0, expenses: 0 }
        months[m].expenses += Number(e.amount)
      }

      const monthlyArr = Object.entries(months)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 6)
        .map(([month, data]) => ({
          month,
          income: data.income,
          expenses: data.expenses,
          profit: data.income - data.expenses,
        }))

      setMonthlyData(monthlyArr)
      setLoading(false)
    }
    loadData()
  }, [])

  const profit = totalIncome - totalExpenses
  const margin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : '0'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Rentabilidad" description="Resumen financiero del emprendimiento" />

      {/* Main KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500 p-2 rounded-lg text-white"><TrendingUp size={20} /></div>
            <span className="text-sm text-gray-500">Ingresos Totales</span>
          </div>
          <p className="text-2xl font-bold text-green-700">${totalIncome.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-500 p-2 rounded-lg text-white"><TrendingDown size={20} /></div>
            <span className="text-sm text-gray-500">Gastos Totales</span>
          </div>
          <p className="text-2xl font-bold text-red-700">${totalExpenses.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`${profit >= 0 ? 'bg-emerald-500' : 'bg-red-500'} p-2 rounded-lg text-white`}><DollarSign size={20} /></div>
            <span className="text-sm text-gray-500">Ganancia Neta</span>
          </div>
          <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            ${profit.toLocaleString('es-AR')}
          </p>
          <p className="text-sm text-gray-400">Margen: {margin}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-500 p-2 rounded-lg text-white"><DollarSign size={20} /></div>
            <span className="text-sm text-gray-500">Pendiente de Cobro</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">${pendingAmount.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Inversión Total</p>
          <p className="text-xl font-bold text-indigo-700">${totalInvestments.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Producción Total</p>
          <p className="text-xl font-bold text-amber-700">{totalProduction.toLocaleString('es-AR')} huevos</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Mortandad Total</p>
          <p className="text-xl font-bold text-red-600">{totalMortality} gallinas</p>
        </div>
      </div>

      {/* Monthly breakdown */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Resumen Mensual</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Mes</th>
                <th className="text-right px-4 py-3 font-medium">Ingresos</th>
                <th className="text-right px-4 py-3 font-medium">Gastos</th>
                <th className="text-right px-4 py-3 font-medium">Ganancia</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {monthlyData.map(m => (
                <tr key={m.month} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{m.month}</td>
                  <td className="px-4 py-3 text-right text-green-700">${m.income.toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-right text-red-700">${m.expenses.toLocaleString('es-AR')}</td>
                  <td className={`px-4 py-3 text-right font-bold ${m.profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    ${m.profit.toLocaleString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
