enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED'
}
const tableStatusLabels: Record<string, string> = {
  [TableStatus.AVAILABLE]: 'Disponível',
  [TableStatus.OCCUPIED]: 'Ocupada',
  [TableStatus.RESERVED]: 'Reservada'
}
export { TableStatus, tableStatusLabels }
