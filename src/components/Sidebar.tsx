'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users,
  ShoppingCart,
  Package,
  Egg,
  Heart,
  TrendingUp,
  DollarSign,
  BarChart3,
  Menu,
  X,
  Home,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/productos', label: 'Productos', icon: Package },
  { href: '/stock', label: 'Stock', icon: Egg },
  { href: '/postura', label: 'Postura Diaria', icon: Egg },
  { href: '/sanidad', label: 'Sanidad', icon: Heart },
  { href: '/inversiones', label: 'Inversiones', icon: TrendingUp },
  { href: '/gastos', label: 'Gastos', icon: DollarSign },
  { href: '/dashboard', label: 'Rentabilidad', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-amber-600 text-white p-2 rounded-lg shadow-lg"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-amber-900 text-white transform transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="p-6 border-b border-amber-800">
          <h1 className="text-xl font-bold">La Señora</h1>
          <p className="text-amber-300 text-sm">de los Huevos</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                  ${isActive
                    ? 'bg-amber-700 text-white'
                    : 'text-amber-200 hover:bg-amber-800 hover:text-white'
                  }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
