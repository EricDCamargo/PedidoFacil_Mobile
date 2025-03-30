import { Slot, Stack } from 'expo-router'
import { AuthProvider } from '../contexts/AuthContext'
import React from 'react'
import { StatusBar } from 'react-native'

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar backgroundColor={'#1d1d2e'} barStyle="dark-content" />
      <Slot />
    </AuthProvider>
  )
}
