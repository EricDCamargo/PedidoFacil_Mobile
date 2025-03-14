import React, { createContext, ReactNode, useEffect, useState } from 'react'
import { Category, Product } from '../types'
import { serviceConsumer } from '../services/service.consumer'

interface OrderContextData {
  products: [] | Product[]
  categories: [] | Category[]
}
interface OrderProviderProps {
  children: ReactNode
}
export const OrderContext = createContext({} as OrderContextData)

export function OrderProvider({ children }: OrderProviderProps) {
  const [products, setProducts] = useState<Product[] | []>([])
  const [categories, setCategories] = useState<Category[] | []>([])

  async function loadData() {
    const [categoryResponse, productResponse] = await Promise.all([
      serviceConsumer().executeGet('/category'),
      serviceConsumer().executeGet('/products')
    ])

    setCategories([{ id: '', name: 'Todos' }, ...categoryResponse.data])
    setProducts(productResponse.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <OrderContext.Provider value={{ products, categories }}>
      {children}
    </OrderContext.Provider>
  )
}
