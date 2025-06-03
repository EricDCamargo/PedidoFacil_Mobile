import React, { useEffect, useRef } from 'react'
import { StyleSheet, View, Animated, Easing } from 'react-native'
import { Feather } from '@expo/vector-icons'

export default function Loading() {
  const rotateValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    )
    rotateAnimation.start()
  }, [rotateValue])

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Feather name="loader" size={64} color="#FFF" />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1d1d2e',
    color: 'white'
  }
})
