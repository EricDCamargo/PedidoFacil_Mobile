import { AuthContext, useAuth } from '@/src/contexts/AuthContext'
import AppProvider from '@/src/contexts/providers'
import { Redirect, Slot } from 'expo-router'
import React, { useContext } from 'react'

export default function Layout() {
  const { user } = useAuth()

  return !user ? (
    <Redirect href="/signin/" />
  ) : (
    <AppProvider>
      <Slot />
    </AppProvider>
  )
}
