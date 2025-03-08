import { StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function Loading() {
  return (
    <div style={styles.container}>
      <Ionicons name="refresh-circle" size={28} color="#FFF" />
    </div>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white'
  },
  icon: {
    width: 40,
    height: 40,
    transform: [{ rotate: '360deg' }]
  }
})
