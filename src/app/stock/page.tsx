'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StockActual } from '@/lib/types'
import PageHeader from '@/components/PageHeader'
import { RefreshCw } from 'lucide-react'

const CATEGORIA_LABEL: Record<StockActual['categoria'], string> = {
  medianos: 'Medianos',
  grandes: 'Grandes',
  xl: 'XL',
}

const CATEGORIA_ORDER: StockActual['categoria'][] = ['medianos', 'grandes', 'xl']

export default function StockPage() {
  const [rows, setRows] = useState<StockActual[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadData() {
    const { data, error } = await supabase.from('stock_actual').select('*')
    if (error) {
      alert('Error al cargar stock: ' + error.message)
      setLoading(false)
      return
    }
    setRows(data || [])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { loadData() }, [])

  function refresh() {
    setRefreshing(true)
    loadData()
  }

  const sorted = CATEGORIA_ORDER
    .map(cat => rows.find(r => r.categoria === cat))
    .filter((r): r is StockActual => !!r)

  return (
    <div>
      <PageHeader
        title="Stock"
        description="Calculado automáticamente desde posturas y pedidos"
        action={
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sorted.map(r => {
            const pendientes = r.maples_stock_real - r.maples_stock_disponible
            const unidad = r.maple_size === 30 ? 'maples' : 'medio-maples'
            return (
              <div
                key={r.categoria}
                className="bg-white rounded-xl shadow-sm border p-5"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  {CATEGORIA_LABEL[r.categoria]}
                </p>
                <p className="text-4xl font-bold text-amber-700">
                  {r.maples_stock_disponible}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  {unidad} disponibles
                </p>

                {r.huevos_sueltos > 0 && (
                  <p className="text-xs text-gray-400 mb-3">
                    + {r.huevos_sueltos} huevos sueltos
                  </p>
                )}

                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Stock real</span>
                    <span className="font-medium">
                      {r.maples_stock_real} {r.maple_size === 30 ? 'mpl' : 'm/mpl'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>En pedidos pendientes</span>
                    <span className="font-medium">
                      {pendientes}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6 leading-relaxed">
        El stock se calcula en tiempo real restando los pedidos pagados a las posturas.
        El stock disponible descuenta además los pedidos pendientes.
      </p>
    </div>
  )
}
