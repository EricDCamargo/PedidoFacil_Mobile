import React, { useState, useEffect } from 'react'
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  View
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StackPramsList } from '../../routes/app.routes'
import { api } from '../../services/api'
import Toast from 'react-native-toast-message'

interface Table {
  id: string
  number: string
  status: 'OCCUPIED' | 'AVAILABLE'
}

export default function Dashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>()
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<{
    id: string
    number: string
  } | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [customerName, setCustomerName] = useState('')

  useEffect(() => {
    async function loadTables() {
      try {
        const response = await api.get('/tables')
        setTables(response.data.data)
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: response.data.message
        })
      } catch (error) {
        console.error('Erro ao buscar mesas:', error)
      }
    }
    loadTables()
  }, [])

  function handleOpenOrder(tableId: string, tableNumber: string) {
    setSelectedTable({ id: tableId, number: tableNumber })
    setIsModalVisible(true)
  }

  async function confirmOrder() {
    if (!customerName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, insira o nome do cliente.', 
      })
      return
    }

    try {
      const response = await api.post('/order', {
        table_id: selectedTable?.id,
        name: customerName
      })
      setIsModalVisible(false)
      setCustomerName('')

      navigation.navigate('Order', {
        number: selectedTable?.number!,
        order_id: response.data.data.id
      })
    } catch (error) {
      console.error('Erro ao abrir pedido:', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Selecione uma mesa</Text>

      <FlatList
        data={tables}
        numColumns={2}
        keyExtractor={item => item.id}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        style={styles.tablesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tableButton,
              {
                backgroundColor:
                  item.status === 'OCCUPIED' ? '#ff3b3b' : '#3fffa3'
              }
            ]}
            onPress={() => handleOpenOrder(item.id, item.number)}
          >
            <Text style={styles.tableText}>Mesa {item.number}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nome do Cliente</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome do cliente"
              placeholderTextColor="#999"
              value={customerName}
              onChangeText={setCustomerName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmOrder}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#1d1d2e'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center'
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#3fffa3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#101026'
  }
})
