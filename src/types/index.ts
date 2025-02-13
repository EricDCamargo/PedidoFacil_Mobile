export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  price: string
  category_id: string
}

export interface OrderProps {
  id: string
  number: number
  table_id: string
  status: string
  name: string
  total: number
  created_at: string
  updated_at: string
  items: OrderItem[]
  paymentOrders: any[]
}

export interface OrderItem {
  id: string
  amount: number
  unit_value: number
  total_value: number
  observation: string
  product: Product
}
