import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/Sidebar"

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "La Señora de los Huevos",
  description: "Gestión de ventas de huevos de campo",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geist.variable} h-full`}>
      <body className="h-full flex bg-gray-50 font-sans">
        <Sidebar />
        <main className="flex-1 lg:ml-0 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
