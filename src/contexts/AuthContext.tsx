import React, { useState, createContext, ReactNode, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { UserProps } from '../types'
import { serviceConsumer } from '../services/service.consumer'
import { StatusCodes } from 'http-status-codes'
import Toast from 'react-native-toast-message'
import { useRouter } from 'expo-router'

type AuthContextData = {
  user: UserProps
  isAuthenticated: boolean
  signIn: (credentials: SignInProps) => Promise<void>
  loadingAuth: boolean
  loading: boolean
  signOut: () => Promise<void>
}

type AuthProviderProps = {
  children: ReactNode
}

type SignInProps = {
  email: string
  password: string
}

export const AuthContext = createContext({} as AuthContextData)

const newUser: UserProps = {
  id: '',
  name: '',
  email: '',
  role: '',
  token: ''
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserProps>(newUser)
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user.name
  useEffect(() => {
    console.log('isAuthenticated', isAuthenticated)
  }, [isAuthenticated])

  useEffect(() => {
    if (loading) return

    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard')
    } else {
      router.replace('/(auth)/signin')
    }
  }, [isAuthenticated, loading])

  useEffect(() => {
    async function getUser() {
      //Retrieve Saved User Data
      const userSession = await AsyncStorage.getItem('@userSession')
      let hasUser: UserProps = JSON.parse(userSession || '{}')

      //Verify user data
      if (Object.keys(hasUser).length > 0) {
        setUser(hasUser)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  async function signIn({ email, password }: SignInProps) {
    setLoadingAuth(true)

    const res = await serviceConsumer().executePost('/session', {
      email,
      password
    })
    if (res.isOk && res.status === StatusCodes.OK) {
      const data: UserProps = res.data
      await AsyncStorage.setItem('@userSession', JSON.stringify(data))

      setUser(data)
      Toast.show({
        type: 'success',
        text1: res.message
      })
      router.replace('(tabs)/dashboard')
    } else {
      Toast.show({
        type: 'error',
        text1: res.message
      })
    }

    setLoadingAuth(false)
  }

  async function signOut() {
    await AsyncStorage.clear()
      .then(() => {
        setUser(newUser)
      })
      .finally(() => {
        router.replace('(auth)/signin')
      })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signIn,
        loading,
        loadingAuth,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
