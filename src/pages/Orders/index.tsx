import React, { useState, useEffect } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Modal
} from 'react-native'
import {
  useRoute,
  useNavigation,
  useFocusEffect
} from '@react-navigation/native'
import { api } from '../../services/api'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StackPramsList } from '../../routes/app.routes'
import { Ionicons } from '@expo/vector-icons'
import { OrderProps } from '../../types'
import { formatCurrency } from '../../utils'
import Toast from 'react-native-toast-message'
import {
  OrderStatus,
  orderStatusColors,
  orderStatusLabels
} from '../../utils/records/order.record'

interface RouteParams {
  tableNumber: string
  tableId: string
}

export default function Orders() {
  const route = useRoute()
  const { tableNumber, tableId } = route.params as RouteParams
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>()

  const [orders, setOrders] = useState<OrderProps[]>([])
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [customerName, setCustomerName] = useState('')

  async function loadOrders() {
    try {
      const response = await api.get(`/orders?table_id=${tableId}`)
      setOrders(response.data.data)
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: response.data.message
      })
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [tableId])

  useFocusEffect(
    React.useCallback(() => {
      loadOrders()
    }, [tableId])
  )

  function toggleOrderItems(orderId: string) {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  function handleOrderPress(order: OrderProps) {
    if (order.status === 'DRAFT') {
      navigation.navigate('Order', {
        number: order.number,
        order_id: order.id
      })
    }
  }

  async function submitOrder() {
    try {
      const response = await api.post('/order', {
        table_id: tableId,
        name: customerName
      })
      const newOrder = response.data.data
      setIsModalVisible(false)
      setCustomerName('')
      loadOrders()
      navigation.navigate('Order', {
        number: newOrder.number,
        order_id: newOrder.id
      })
    } catch (error) {
      console.error('Erro ao adicionar pedido:', error)
    }
  }

  async function handleAddOrder() {
    if (!customerName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, insira o nome do cliente.'
      })
      return
    }
    submitOrder()
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos - Mesa: {tableNumber}</Text>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Cliente</Text>
        <Text style={styles.headerText}> | </Text>
        <Text style={styles.headerText}>Status</Text>
        <Text style={styles.headerText}> | </Text>
        <Text style={styles.headerText}>Valor P</Text>
        <Text style={styles.headerText}> | </Text>
        <Text style={styles.headerText}>Detalhes</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={order => order.id}
        renderItem={({ item: order }) => (
          <View
            style={[
              styles.status,
              {
                backgroundColor:
                  orderStatusColors[order.status as OrderStatus].background
              }
            ]}
          >
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleOrderPress(order)}
            >
              <Text style={styles.itemText}>{order.name}</Text>
              <Text
                style={[
                  styles.itemText,
                  {
                    color: orderStatusColors[order.status as OrderStatus].color
                  }
                ]}
              >
                {orderStatusLabels[order.status]}
              </Text>
              <Text style={styles.itemText}>{formatCurrency(order.total)}</Text>
              <TouchableOpacity
                style={{ borderWidth: 1 }}
                onPress={() => toggleOrderItems(order.id)}
              >
                <Ionicons name="chevron-down-outline" size={28} color="#FFF" />
              </TouchableOpacity>
            </TouchableOpacity>

            {expandedOrderId === order.id && order.items[0] && (
              <View>
                <View style={styles.headerRow}>
                  <Text style={styles.headerText}>Qnt</Text>
                  <Text style={styles.headerText}>Desc</Text>
                  <Text style={styles.headerText}>Valor Un</Text>
                  <Text style={styles.headerText}>Valor Total</Text>
                </View>
                <FlatList
                  data={order.items}
                  keyExtractor={subItem => subItem.id}
                  renderItem={({ item: subItem }) => (
                    <View style={styles.subItem}>
                      <Text style={styles.subItemText}>{subItem.amount}X</Text>
                      <Text style={styles.subItemText}>
                        {subItem.product.name}
                      </Text>
                      <Text style={styles.subItemText}>
                        {formatCurrency(subItem.unit_value)}
                      </Text>
                      <Text style={styles.subItemText}>
                        {formatCurrency(subItem.total_value)}
                      </Text>
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        )}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Toast />
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
                onPress={handleAddOrder}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1d1d2e'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF'
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#333',
    paddingHorizontal: 10,
    borderRadius: 8
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 5
  },
  headerText: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    margin: 5,
    borderRadius: 8
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  itemText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  addButton: {
    backgroundColor: '#3fffa3',
    padding: 10,
    borderRadius: 50
  },
  subItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 5,
    backgroundColor: '#333',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8
  },
  subItemText: {
    color: '#FFF'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#1d1d2e',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: '#FFF'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20
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
  },
  status: {
    padding: 5,
    borderRadius: 5,
    marginTop: 5
  }
})
