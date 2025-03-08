import React, { useContext, useEffect } from 'react'

import { View, ActivityIndicator, BackHandler, Alert } from 'react-native'

import AppRoutes from './app.routes'
import AuthRoutes from './auth.routes'

import { AuthContext } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'

function Routes() {
  const { isAuthenticated, loading } = useContext(AuthContext)
  const navigation = useNavigation()

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        Alert.alert('Atenção!', 'Deseja sair?', [
          {
            text: 'Não',
            onPress: () => null,
            style: 'cancel'
          },
          { text: 'Sim', onPress: () => BackHandler.exitApp() }
        ])
        return true
      }
      return true
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )

    return () => backHandler.remove()
  }, [])

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#1D1D2E',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <ActivityIndicator size={60} color="#FFF" />
      </View>
    )
  }

  return isAuthenticated ? <AppRoutes /> : <AuthRoutes />
}

export default Routes
