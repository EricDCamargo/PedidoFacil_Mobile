import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Dashboard from '../pages/Dashboard'
import Orders from '../pages/Orders'
import FinishOrder from '../pages/FinishOrder'
import Order from '../pages/Order'

export type StackPramsList = {
  Dashboard: undefined
  Orders: {
    tableNumber: number | string
    tableId: string
  }
  Order: {
    number: number | string
    order_id: string
  }
  FinishOrder: {
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

      <Stack.Screen
        name="FinishOrder"
        component={FinishOrder}
        options={{
          title: 'Finalizando',
          headerStyle: {
            backgroundColor: '#1d1d2e'
          },
          headerTintColor: '#FFF'
        }}
      />
    </Stack.Navigator>
  )
}

export default AppRoutes
