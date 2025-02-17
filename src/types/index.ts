import { OrderStatus } from '../utils/records/order.record'

export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  price: number
  description: string
  banner: string
  created_at: string
  updated_at: string
  category_id: string
}

export interface OrderProps {
  id: string
  number: number
  table_id: string
  status: OrderStatus
  name: string
  total: number
  created_at: string
  updated_at: string
  items: OrderItem[]
  paymentOrders: any[]
}

export interface OrderDetails {
  id: string
  number: number
  table_id: string
  status: string
  name: string
  total: number
  created_at: string
  updated_at: string
  items: OrderItem[]
  table: Table
  paymentOrders: PaymentOrder[]
}

export interface OrderItem {
  id: string
  amount: number
  unit_value: number
  total_value: number
  observation: string
  created_at: string
  updated_at: string
  order_id: string
  product_id: string
  product: Product
}

interface Table {
  id: string
  number: string
  status: string
  created_at: string
  updated_at: string
}
interface Payment {
  id: string
  table_id: string
  value: number
  payment_method: string
  change: number
  created_at: string
  updated_at: string
}

interface PaymentOrder {
  id: string
  payment_id: string
  order_id: string
  value: number
  created_at: string
  updated_at: string
  payment: Payment
}
