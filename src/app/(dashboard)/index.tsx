import React, { useContext, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  View
} from 'react-native'
import { useAuth } from '@/src/contexts/AuthContext'
import { TableContext } from '@/src/contexts/TableContext'
import {
  tableStatusColors,
  TableStatus
} from '@/src/utils/records/table.record'
import { router } from 'expo-router'
import { Table } from '@/src/types'

export default function Tables() {
  const { signOut, user } = useAuth()
  const { tables, fetchTables } = useContext(TableContext)

  useEffect(() => {
    fetchTables()
  }, [])

  async function handleOpenTable(table: Table) {
    router.push(`/orders/${table.id}`)
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
            onPress={() => handleOpenTable(table)}
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
