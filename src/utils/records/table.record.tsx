enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED'
}

const tableStatusColors: Record<TableStatus, string> = {
  [TableStatus.AVAILABLE]: '#3fffa3',
  [TableStatus.OCCUPIED]: '#ff3b3b',
  [TableStatus.RESERVED]: '#ff9800'
}

const tableStatusLabels: Record<string, string> = {
  [TableStatus.AVAILABLE]: 'Disponível',
  [TableStatus.OCCUPIED]: 'Ocupada',
  [TableStatus.RESERVED]: 'Reservada'
}
export { TableStatus, tableStatusLabels, tableStatusColors }
