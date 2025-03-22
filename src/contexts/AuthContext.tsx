import React, {
  useState,
  createContext,
  ReactNode,
  useEffect,
  useContext
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserProps } from '../types'
import { serviceConsumer } from '../services/service.consumer'
import { StatusCodes } from 'http-status-codes'
import Toast from 'react-native-toast-message'
import { useRouter } from 'expo-router'

type AuthContextData = {
  user: UserProps | null
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

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()

  const [user, setUser] = useState<UserProps | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      //Retrieve Saved User Data
      const userSession = await AsyncStorage.getItem('@userSession')
      let hasUser: UserProps = JSON.parse(userSession || '{}')

      //Verify user data in api
      if (Object.keys(hasUser).length > 0) {
        const res = await serviceConsumer().executeGet('/me')
        if (res.isOk && res.status === StatusCodes.OK) {
          setUser(res.data)
        }
      }
      setLoading(false)
    }

    getUser()
  }, [])

  useEffect(() => {
    if (loading) return

    if (user) {
      router.replace('(dashboard)')
    } else {
      router.replace('(auth)')
    }
  }, [user, loading])

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
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context)
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
