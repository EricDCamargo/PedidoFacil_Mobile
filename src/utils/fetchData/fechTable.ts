import { serviceConsumer } from '../../services/service.consumer'
import { Table } from '../../types'

async function loadTables(): Promise<Table[]> {
  const res = await serviceConsumer().executeGet('/tables')
  return res.data || []
}
export { loadTables }
