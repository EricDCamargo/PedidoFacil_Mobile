import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserProps } from '../types'

export async function getCookieClient() {
  const userSession = await AsyncStorage.getItem('@userSession')
  let hasUser: UserProps = JSON.parse(userSession || '{}')

  const token = hasUser.token

  return token
}
