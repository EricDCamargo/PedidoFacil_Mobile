import React, { useState, useEffect, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Image
} from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import Toast from 'react-native-toast-message'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Category, OrderDetails, Product } from '@/src/types'
import { serviceConsumer } from '@/src/services/service.consumer'

import { formatCurrency } from '@/src/utils'
import { OrderContext } from '@/src/contexts/OrderContext'
import FinishOrderModal from '../../_components/FinishOrderModal'

export default function Order() {
  const router = useRouter()
  const { order_id } = useLocalSearchParams()

  const { products, categories } = useContext(OrderContext)

  const [categorySelected, setCategorySelected] = useState<Category>()
  const [productSelected, setProductSelected] = useState<Product | undefined>()

  const [filteredProducts, setFilteredProducts] = useState<Product[] | []>()

  const [modalProductVisible, setModalProductVisible] = useState(false)
  const [modalOrderVisible, setModalOrderVisible] = useState(false)

  const [amount, setAmount] = useState<number>(0)
  const [observation, setObservation] = useState('')
  const [search, setSearch] = useState('')
  const [currentOrder, setCurrentOrder] = useState<OrderDetails>()

  useEffect(() => {
    async function loadData() {
      const res = await serviceConsumer().executeGet('/order/detail', {
        order_id
      })

      setCategorySelected({ id: '', name: 'Todos' })
      setCurrentOrder(res.data)
    }

    loadData()
  }, [order_id])

  async function loadOrderDetails() {
    const res = await serviceConsumer().executeGet('order/detail', { order_id })
    setCurrentOrder(res.data)
    Toast.show({
      type: 'info',
      text1: res.message
    })
  }

  useEffect(() => {
    filterProducts()
  }, [categorySelected, search])

  function filterProducts() {
    let filtered = products
    if (categorySelected && categorySelected.id) {
      filtered = filtered.filter(
        product => product.category_id === categorySelected.id
      )
    }
    if (search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase())
      )
    }
    setFilteredProducts(filtered)
  }

  async function handleCloseOrder() {
    const res = await serviceConsumer().executeDelete('/order', { order_id })
    if (res.isOk) {
      router.back()
    }
  }

  function handleChangeCategory(itemValue: string) {
    const selectedCategory = categories.find(cat => cat.id === itemValue)

    setCategorySelected(selectedCategory!)
  }

  function handleChangeAmount(text: string) {
    const value = Number(text)
    if (Number.isInteger(value)) {
      setAmount(value)
    } else {
      Alert.alert(
        'Erro',
        'Digite uma quantidade válida (número inteiro positivo).'
      )
    }
  }

  async function handleAdd() {
    if (!productSelected) {
      Alert.alert('Erro', 'Selecione um produto.')
      return
    }
    if (amount <= 0 || !Number.isInteger(amount)) {
      Alert.alert(
        'Erro',
        'Digite uma quantidade válida (número inteiro positivo).'
      )
      return
    }
    if (!currentOrder) {
      Alert.alert('Erro', 'Um produto não foi selecionado')
      return
    }
    const data = {
      order_id: currentOrder.id,
      product_id: productSelected.id,
      amount,
      observation
    }
    const res = await serviceConsumer().executePost('/order/add', data)
    if (res.isOk) {
      await loadOrderDetails()
      setModalProductVisible(false)
      setAmount(0)
      setObservation('')
    }
    Toast.show({
      type: 'info',
      text1: res.message
    })
  }

  const handleCancel = () => {
    setModalProductVisible(false)
    setProductSelected(undefined)
    setAmount(0)
    setObservation('')
  }

  async function handleDeleteItem(item_id: string) {
    const res = await serviceConsumer().executeDelete('order/remove', {
      item_id
    })
    Toast.show({
      type: 'info',
      text1: res.message
    })
    await loadOrderDetails()
  }

  async function handleFinishOrder() {
    const res = await serviceConsumer().executePut(
      '/order/send',
      {},
      {
        order_id: currentOrder?.id
      }
    )
    if (res.isOk) {
      router.back()
    }
    Toast.show({
      type: 'info',
      text1: res.message
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.hTitleContainer}>
          <Text style={styles.title}>Pedido nº {currentOrder?.number}</Text>

          <TouchableOpacity onPress={handleCloseOrder}>
            <Feather name="trash-2" size={28} color="#FF3F4b" />
          </TouchableOpacity>
        </View>
        <View style={styles.cartContainer}>
          <TouchableOpacity onPress={() => setModalOrderVisible(true)}>
            <Ionicons name="cart" size={28} color="#FFF" />
          </TouchableOpacity>
          {currentOrder?.items[0] && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{currentOrder.items.length}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.bodyContent}>
        {categories[0] && (
          <Picker
            selectedValue={categorySelected?.id}
            style={styles.picker}
            mode="dropdown"
            dropdownIconColor={'white'}
            onValueChange={itemValue => handleChangeCategory(itemValue)}
          >
            {categories.map(cat => (
              <Picker.Item
                color="white"
                style={styles.pickerItem}
                key={cat.id}
                label={cat.name}
                value={cat.id}
              />
            ))}
          </Picker>
        )}
        <TextInput
          style={styles.input}
          placeholder="Pesquisar produtos"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productItem}
              onPress={() => {
                setProductSelected(item)
                setModalProductVisible(true)
              }}
            >
              <Image
                source={{ uri: item.banner }}
                style={styles.productImage}
              />
              <Text style={styles.productText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FinishOrderModal
        currentOrder={currentOrder}
        handleDeleteItem={handleDeleteItem}
        handleFinishOrder={handleFinishOrder}
        onClose={() => setModalOrderVisible(false)}
        visible={modalOrderVisible}
      />

      <Modal
        transparent={true}
        visible={modalProductVisible}
        animationType="slide"
        onRequestClose={() => setModalProductVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Adicionar ao pedido</Text>
            <Text style={styles.modalSubtitle}>{productSelected?.name}</Text>
            <Text style={styles.modalSubtitle}>
              {productSelected?.description}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount.toString()}
              onChangeText={handleChangeAmount}
            />
            <Text style={styles.modalSubtitle}>
              Total:{' '}
              {formatCurrency(
                productSelected?.price ? productSelected.price * amount : 0
              )}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Observação"
              placeholderTextColor="#999"
              value={observation}
              onChangeText={setObservation}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAdd}
              >
                <Text style={styles.buttonText}>Adicionar</Text>
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
    backgroundColor: '#1d1d2e',
    paddingVertical: '5%',
    paddingEnd: '4%',
    paddingStart: '4%'
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    marginTop: 24,
    justifyContent: 'space-between'
  },
  hTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 14
  },
  bodyContent: {
    gap: 10
  },
  input: {
    backgroundColor: '#101026',
    borderRadius: 4,
    width: '100%',
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
    color: '#FFF',
    fontSize: 20
  },
  picker: {
    color: '#FFF',
    backgroundColor: '#101026'
  },
  pickerItem: {
    backgroundColor: '#101026'
  },
  qtdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  qtdText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF'
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between'
  },
  buttonAdd: {
    width: '20%',
    backgroundColor: '#3fd1ff',
    borderRadius: 4,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#101026',
    fontSize: 18,
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: '#3fffa3',
    borderRadius: 4,
    height: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productItem: {
    backgroundColor: '#101026',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    flex: 1,
    margin: 5
  },
  productText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 10
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8
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
    borderRadius: 8
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
    padding: 10,
    borderRadius: 8
  },
  confirmButton: {
    backgroundColor: '#3fffa3',
    padding: 10,
    borderRadius: 8
  },
  cartContainer: {
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF3F4b',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold'
  }
})
