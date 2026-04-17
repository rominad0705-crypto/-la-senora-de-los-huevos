const statusColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  entregado: 'bg-blue-100 text-blue-800',
  pagado: 'bg-green-100 text-green-800',
}

const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  entregado: 'Entregado',
  pagado: 'Pagado',
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusLabels[status] || status}
    </span>
  )
}
