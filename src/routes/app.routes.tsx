import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Orders from '../pages/Orders'

import Order from '../pages/Order'
import Dashboard from '../pages/Dashboard'

export type StackPramsList = {
  Dashboard: undefined
  Orders: {
    table_id: string
    number: string
  }
  Order: {
    number: number | string
    order_id: string
  }
}

const Stack = createNativeStackNavigator<StackPramsList>()

function AppRoutes() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Orders"
        component={Orders}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Order"
        component={Order}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

export default AppRoutes
