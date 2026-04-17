'use client'

import Link from 'next/link'
import Image from 'next/image'
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
      {/* Mobile toggle - open button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden bg-amber-600 text-white p-2 rounded-lg shadow-lg"
        >
          <Menu size={24} />
        </button>
      )}

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
        <div className="p-4 border-b border-amber-800 flex items-center gap-3">
          <Image src="/logo.jpg" alt="Logo" width={48} height={48} className="rounded-full" />
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">La Señora</h1>
            <p className="text-amber-300 text-sm">de los Huevos</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-amber-300 hover:text-white">
            <X size={24} />
          </button>
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
