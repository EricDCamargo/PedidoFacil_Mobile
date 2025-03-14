import { AuthProvider } from '@/src/contexts/AuthContext'
import { TableProvider } from '@/src/contexts/TableContext'
import { OrderProvider } from './OrderContext'

interface AppProvider {
  children: React.ReactNode
}

export default function AppProvider({ children }: AppProvider) {
  return (
    <TableProvider>
      <OrderProvider>{children}</OrderProvider>
    </TableProvider>
  )
}
