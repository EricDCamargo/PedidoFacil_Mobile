enum OrderStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAID = 'PAID',
  CLOSED = 'CLOSED'
}

const orderStatusColors: Record<
  OrderStatus,
  { background: string; color: string }
> = {
  [OrderStatus.DRAFT]: {
    background: 'rgba(211, 211, 211, 0.1)',
    color: '#6c757d'
  },
  [OrderStatus.IN_PROGRESS]: {
    background: 'rgba(255, 167, 11, 0.1)',
    color: '#ffa70b'
  },
  [OrderStatus.COMPLETED]: {
    background: 'rgba(40, 167, 69, 0.1)',
    color: '#28a745'
  },
  [OrderStatus.PAID]: {
    background: 'rgba(23, 162, 184, 0.1)',
    color: '#17a2b8'
  },
  [OrderStatus.CLOSED]: {
    background: 'rgba(211, 64, 83, 0.1)',
    color: '#d34053'
  }
}

const orderStatusLabels: Record<string, string> = {
  [OrderStatus.DRAFT]: 'Rascunho',
  [OrderStatus.IN_PROGRESS]: 'Em andamento',
  [OrderStatus.COMPLETED]: 'Concluído',
  [OrderStatus.PAID]: 'Pago',
  [OrderStatus.CLOSED]: 'Fechado'
}
export { OrderStatus, orderStatusColors, orderStatusLabels }
