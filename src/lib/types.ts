export type ClientType = 'particular' | 'negocio'
export type OrderStatus = 'pendiente' | 'entregado' | 'pagado'
export type PaymentMethod = 'efectivo' | 'transferencia'

export interface Client {
  id: string
  name: string
  phone: string
  address: string
  zone: string
  type: ClientType
  notes: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  unit_size: number
  price_particular: number
  price_negocio: number | null
  active: boolean
}

export interface Order {
  id: string
  client_id: string
  date: string
  status: OrderStatus
  payment_method: PaymentMethod | null
  total: number
  notes: string
  created_at: string
  client?: Client
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  product?: Product
}

export interface DailyProduction {
  id: string
  date: string
  medium_eggs: number
  large_eggs: number
  xl_eggs: number
  total_eggs: number
  notes: string
}

export interface StockEntry {
  id: string
  date: string
  medium_stock: number
  large_stock: number
  xl_stock: number
  notes: string
}

export interface Investment {
  id: string
  date: string
  category: string
  description: string
  amount: number
  notes: string
}

export interface Expense {
  id: string
  date: string
  category: string
  description: string
  amount: number
  notes: string
}

export interface Mortality {
  id: string
  date: string
  quantity: number
  cause: string
  notes: string
}
