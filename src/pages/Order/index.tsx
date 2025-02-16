import React, { useState, useEffect } from 'react'
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
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import { Feather, Ionicons } from '@expo/vector-icons'
import { api } from '../../services/api'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StackPramsList } from '../../routes/app.routes'
import { Picker } from '@react-native-picker/picker'
import { OrderDetails, Product } from '../../types'
import { FinishOrderModal } from '../../components/FinishOrderModal'

type RouteDetailParams = {
  Order: {
    number: string | number
    order_id: string
  }
}

export type CategoryProps = {
  id: string
  name: string
}

type OrderRouteProps = RouteProp<RouteDetailParams, 'Order'>

export default function Order() {
  const route = useRoute<OrderRouteProps>()
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>()

  const [category, setCategory] = useState<CategoryProps[] | []>([])
  const [categorySelected, setCategorySelected] = useState<
    CategoryProps | undefined
  >({
    id: '',
    name: 'Todos'
  })

  const [products, setProducts] = useState<Product[] | []>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[] | []>([])
  const [productSelected, setProductSelected] = useState<Product | undefined>()

  const [modalProductVisible, setModalProductVisible] = useState(false)
  const [modalOrderVisible, setModalOrderVisible] = useState(false)

  const [amount, setAmount] = useState<number>(0)
  const [observation, setObservation] = useState('')
  const [search, setSearch] = useState('')
  const [currentOrder, setCurrentOrder] = useState<OrderDetails>()

  useEffect(() => {
    async function loadInfo() {
      const categoryResponse = await api.get('/category')
      setCategory([{ id: '', name: 'Todos' }, ...categoryResponse.data.data])
      setCategorySelected({ id: '', name: 'Todos' })

      const productResponse = await api.get('/products')
      setProducts(productResponse.data.data)
      setFilteredProducts(productResponse.data.data)
    }
    loadInfo()
  }, [])

  async function loadOrderDetails() {
    try {
      const response = await api.get(
        `/order/detail?order_id=${route.params.order_id}`
      )
      setCurrentOrder(response.data.data)
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error)
    }
  }

  useEffect(() => {
    loadOrderDetails()
  }, [route.params.order_id])

  useEffect(() => {
    filterProducts()
  }, [categorySelected, search])

  function filterProducts() {
    let filtered = products
    if (categorySelected && categorySelected.id !== '') {
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
    try {
      await api.delete('/order', {
        params: {
          order_id: route.params?.order_id
        }
      })
      navigation.goBack()
    } catch (err) {
      console.log(err)
    }
  }

  function handleChangeCategory(itemValue: string) {
    const selectedCategory = category.find(cat => cat.id === itemValue)
    setCategorySelected(selectedCategory)
  }

  async function handleAdd() {
    if (!productSelected) {
      Alert.alert('Erro', 'Selecione um produto.')
      return
    }
    try {
      await api.post('/order/add', {
        order_id: route.params.order_id,
        product_id: productSelected.id,
        amount: Number(amount),
        observation
      })
      loadOrderDetails()
      setModalProductVisible(false)
      setAmount(0)
      setObservation('')
    } catch (err) {
      console.log(err)
    }
  }

  async function handleDeleteItem(item_id: string) {
    try {
      await api.delete('/order/remove', {
        params: {
          item_id: item_id
        }
      })
      loadOrderDetails()
    } catch (error) {
      console.log(error)
    }
  }

  async function handleFinishOrder() {
    try {
      const res = await api.put('/order/send', {
        order_id: currentOrder?.id
      })

      navigation.goBack()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.hTitleContainer}>
          <Text style={styles.title}>Pedido nº {route.params.number}</Text>

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

      {category.length !== 0 && (
        <Picker
          selectedValue={categorySelected?.id}
          style={styles.picker}
          onValueChange={itemValue => handleChangeCategory(itemValue)}
        >
          {category.map(cat => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
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
            <Image source={{ uri: item.banner }} style={styles.productImage} />
            <Text style={styles.productText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

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
              onChangeText={text => setAmount(Number(text))}
            />
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
                onPress={() => setModalProductVisible(false)}
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
  input: {
    backgroundColor: '#101026',
    borderRadius: 4,
    width: '100%',
    height: 40,
    marginBottom: 12,
    justifyContent: 'center',
    paddingHorizontal: 8,
    color: '#FFF',
    fontSize: 20
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#FFF',
    backgroundColor: '#101026',
    marginBottom: 12
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
