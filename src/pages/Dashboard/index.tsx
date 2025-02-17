import React, { useState, useContext } from 'react'
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  View
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StackPramsList } from '../../routes/app.routes'
import { api } from '../../services/api'
import {
  TableStatus,
  tableStatusColors
} from '../../utils/records/table.record'
import { AuthContext } from '../../contexts/AuthContext'
import { Ionicons } from '@expo/vector-icons'

interface Table {
  id: string
  number: string
  status: TableStatus.AVAILABLE | TableStatus.OCCUPIED
}

export default function Dashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>()
  const { signOut, user } = useContext(AuthContext)
  const [tables, setTables] = useState<Table[]>([])

  async function loadTables() {
    try {
      const response = await api.get('/tables')
      setTables(response.data.data)
    } catch (error) {
      console.error('Erro ao buscar mesas:', error)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      loadTables()
    }, [])
  )

  async function handleOpenTable(tableId: string, tableNumber: string) {
    navigation.navigate('Orders', {
      tableNumber,
      tableId
    })
  }

  async function handleLogOff() {
    await signOut()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>Olá, {user?.name}</Text>
        <TouchableOpacity onPress={handleLogOff} style={styles.logOffButton}>
          <Ionicons name="log-out-outline" size={40} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Selecione uma mesa</Text>
      <FlatList
        data={tables}
        numColumns={2}
        keyExtractor={table => table.id}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        style={styles.tablesContainer}
        renderItem={({ item: table }) => (
          <TouchableOpacity
            style={[
              styles.tableButton,
              {
                backgroundColor: tableStatusColors[table.status]
              }
            ]}
            onPress={() => handleOpenTable(table.id, table.number)}
          >
            <Text style={styles.tableText}>Mesa {table.number}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#1d1d2e',
    gap: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF'
  },
  logOffButton: {
    padding: 10,
    borderRadius: 5
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 10
  },
  tablesContainer: {
    width: '90%'
  },
  tableButton: {
    height: 80,
    minWidth: '45%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  tableText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#101026'
  }
})
