import AppProvider from '@/src/contexts/providers'
import { Stack } from 'expo-router'
import React from 'react'

export default function TabsLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="dashboard"
          options={{
            title: 'Dashboard'
          }}
        />
        <Stack.Screen
          name="orders/[table_id]"
          options={{
            title: 'Orders'
          }}
        />
        <Stack.Screen
          name="order/[order_id]"
          options={{
            title: 'Order'
          }}
        />
      </Stack>
    </AppProvider>
  )
}
