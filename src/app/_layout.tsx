import { Stack } from 'expo-router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import React from 'react'
import Loading from './_components/loading/loading'

const RootRoutes = () => {
  const { loading } = useAuth()

  if (loading) return <Loading />

  return <Stack screenOptions={{ headerShown: false }} />
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootRoutes />
    </AuthProvider>
  )
}
