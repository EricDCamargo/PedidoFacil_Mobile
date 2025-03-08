import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/contexts/AuthContext'
import Routes from './src/routes'
import { Suspense, useEffect } from 'react'
import { BackHandler } from 'react-native'
import Loading from './src/components/loading/loading'
import { TableProvider } from './src/contexts/TableContext'
export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <TableProvider>
          <StatusBar
            backgroundColor="#1d1d2e"
            translucent={false}
            style="light"
          />
          <Suspense fallback={<Loading />}>
            <Routes />
          </Suspense>
        </TableProvider>
      </AuthProvider>
    </NavigationContainer>
  )
}
