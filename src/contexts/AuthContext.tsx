import React, { useState, createContext, ReactNode, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { api } from '../services/api'
import { UserProps } from '../types'
import { serviceConsumer } from '../services/service.consumer'
import { StatusCodes } from 'http-status-codes'
import Toast from 'react-native-toast-message'

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
  const [user, setUser] = useState<UserProps>(newUser)

  const [loadingAuth, setLoadingAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user.name

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
    console.log(res)
    if (res.isOk && res.status === StatusCodes.OK) {
      const data: UserProps = res.data
      await AsyncStorage.setItem('@userSession', JSON.stringify(data))

      setUser(data)
      Toast.show({
        type: 'success',
        text1: 'Login feito com sucesso!',
        text1: res.message
      })
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro ao fazer logIn!',
        text1: res.message
      })
    }

    setLoadingAuth(false)
  }

  async function signOut() {
    await AsyncStorage.clear().then(() => {
      setUser(newUser)
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
