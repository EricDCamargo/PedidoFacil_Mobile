import React, { createContext, useState, ReactNode, useEffect } from 'react'
import { Table } from '../types'
import { loadTables } from '../utils/fetchData/fetchTable'

interface TableContextData {
  tables: Table[]

  fetchTables: () => Promise<void>
}
interface TableProviderProps {
  children: ReactNode
}
export const TableContext = createContext({} as TableContextData)

export function TableProvider({ children }: TableProviderProps) {
  const [tables, setTables] = useState<Table[]>([])

  const fetchTables = async () => {
    setTables(await loadTables())
  }
  useEffect(() => {
    fetchTables()
  }, [])

  return (
    <TableContext.Provider value={{ tables, fetchTables }}>
      {children}
    </TableContext.Provider>
  )
}
