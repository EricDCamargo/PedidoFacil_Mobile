import React, { useContext, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StackPramsList } from '../../routes/app.routes'
import { AuthContext } from '../../contexts/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { TableContext } from '../../contexts/TableContext'
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  View
} from 'react-native'

import {
  TableStatus,
  tableStatusColors
} from '../../utils/records/table.record'

export default function Dashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>()
  const { signOut, user } = useContext(AuthContext)
  const { tables, fetchTables } = useContext(TableContext)

  useEffect(() => {
    fetchTables()
  }, [])

  async function handleOpenTable(table_id: string, number: string) {
    navigation.navigate('Orders', {
      table_id,
      number
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
                backgroundColor: tableStatusColors[table.status as TableStatus]
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
