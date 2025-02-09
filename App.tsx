import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View } from 'react-native'
import { AuthProvider } from './src/contexts/AuthContext'
import Routes from './src/routes'

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StatusBar
          backgroundColor="#1d1d2e"
          translucent={false}
          style="light"
        />
        <Routes />
      </AuthProvider>
    </NavigationContainer>
  )
}
