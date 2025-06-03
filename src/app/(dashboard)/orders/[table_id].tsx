import React, { useCallback, useContext, useState } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Modal
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { OrderProps } from '@/src/types'
import { serviceConsumer } from '@/src/services/service.consumer'
import {
  OrderStatus,
  orderStatusColors,
  orderStatusLabels
} from '@/src/utils/records/order.record'
import { formatCurrency } from '@/src/utils'
import { TableContext } from '@/src/contexts/TableContext'

export default function Orders() {
  const route = useRouter()
  const { table_id } = useLocalSearchParams()
  const { tables } = useContext(TableContext)

  const [orders, setOrders] = useState<OrderProps[]>([])
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [customerName, setCustomerName] = useState('')

  const loadOrders = useCallback(async () => {
    const res = await serviceConsumer().executeGet('/orders', { table_id })
    setOrders(res.data)
  }, [table_id])

  useFocusEffect(
    useCallback(() => {
      loadOrders()
    }, [loadOrders])
  )

  function toggleOrderItems(orderId: string) {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  function handleOrderPress(order: OrderProps) {
    if (order.status === OrderStatus.DRAFT) {
      route.push(`/order/${order.id}`)
    }
  }

  async function submitOrder() {
    const res = await serviceConsumer().executePost('/order', {
      table_id,
      name: customerName
    })

    const order_id = res.data.id as string

    if (res.isOk) {
      setIsModalVisible(false)
      setCustomerName('')
      await loadOrders()
      route.push(`/order/${order_id}`)
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

  async function handleFinishOrder(order_id: string) {
    const res = await serviceConsumer().executePut(
      '/order/finish',
      {},
      { order_id }
    )

    Toast.show({
      type: 'info',
      text1: res.message
    })
    await loadOrders()
  }

  const tableNumber = tables.find(table => table.id === table_id)?.number

  return (
    <View style={styles.container}>
      <Toast position="bottom" />
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos - Mesa: {tableNumber}</Text>
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
      {orders[0] ? (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>Cliente</Text>
            <Text style={styles.headerText}>Status</Text>
            <Text style={styles.headerText}>Valor P</Text>
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
                        color:
                          orderStatusColors[order.status as OrderStatus].color
                      }
                    ]}
                  >
                    {orderStatusLabels[order.status]}
                  </Text>
                  <Text style={styles.itemText}>
                    {formatCurrency(order.total)}
                  </Text>
                  <TouchableOpacity onPress={() => toggleOrderItems(order.id)}>
                    <Ionicons
                      name="chevron-down-outline"
                      size={28}
                      color="#FFF"
                    />
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
                          <Text style={styles.subItemText}>
                            {subItem.amount}X
                          </Text>
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
                    {order.status === OrderStatus.IN_PROGRESS && (
                      <TouchableOpacity
                        style={styles.finishButton}
                        onPress={() => handleFinishOrder(order.id)}
                      >
                        <Text style={styles.buttonText}>ENTREGAR PEDIDO</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
          />
        </>
      ) : (
        <View style={styles.noOrdersContainer}>
          <Text style={styles.noOrdersText}>Nenhum pedido encontrado.</Text>
        </View>
      )}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
    borderRadius: 8
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white'
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center'
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
  },
  finishButton: {
    backgroundColor: '#3fffa3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noOrdersText: {
    fontSize: 18,
    color: '#FFF'
  }
})
