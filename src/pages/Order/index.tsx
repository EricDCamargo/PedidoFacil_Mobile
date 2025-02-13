import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert
} from 'react-native'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { api } from '../../services/api'
import { ModalPicker } from '../../components/ModalPicker'
import { ListItem } from '../../components/ListItem'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StackPramsList } from '../../routes/app.routes'

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

type ProductProps = {
  id: string
  name: string
  category_id: string
}

type ItemProps = {
  id: string
  product_id: string
  name: string
  amount: string | number
  observation?: string
}

type OrderRouteProps = RouteProp<RouteDetailParams, 'Order'>

export default function Order() {
  const route = useRoute<OrderRouteProps>()
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>()

  const [category, setCategory] = useState<CategoryProps[] | []>([])
  const [categorySelected, setCategorySelected] = useState<
    CategoryProps | undefined
  >()
  const [modalCategoryVisible, setModalCategoryVisible] = useState(false)

  const [products, setProducts] = useState<ProductProps[] | []>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductProps[] | []>([])
  const [productSelected, setProductSelected] = useState<
    ProductProps | undefined
  >()
  const [modalProductVisible, setModalProductVisible] = useState(false)

  const [amount, setAmount] = useState('1')
  const [observation, setObservation] = useState('')
  const [items, setItems] = useState<ItemProps[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadInfo() {
      const categoryResponse = await api.get('/category')
      setCategory(categoryResponse.data.data)
      setCategorySelected(categoryResponse.data.data[0])

      const productResponse = await api.get('/products')
      setProducts(productResponse.data.data)
      setFilteredProducts(productResponse.data.data)
    }
    loadInfo()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [categorySelected, search])

  function filterProducts() {
    let filtered = products

    if (categorySelected) {
      filtered = filtered.filter(product => product.category_id === categorySelected.id)
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

  function handleChangeCategory(item: CategoryProps) {
    setCategorySelected(item)
  }

  function handleChangeProduct(item: ProductProps) {
    setProductSelected(item)
  }

  async function handleAdd() {
    if (!productSelected) {
      Alert.alert('Erro', 'Selecione um produto.')
      return
    }

    const response = await api.post('/order/add', {
      order_id: route.params?.order_id,
      product_id: productSelected.id,
      amount: Number(amount),
      observation: observation
    })
    let data = {
      id: response.data.id,
      product_id: productSelected.id,
      name: productSelected.name,
      amount: amount,
      observation: observation
    }
    setItems(oldArray => [...oldArray, data])
    setModalProductVisible(false)
    setAmount('1')
    setObservation('')
  }

  async function handleDeleteItem(item_id: string) {
    await api.delete('/order/remove', {
      params: {
        item_id: item_id
      }
    })
    let removeItem = items.filter(item => {
      return item.id !== item_id
    })
    setItems(removeItem)
  }

  function handleFinishOrder() {
    navigation.navigate('FinishOrder', {
      number: route.params?.number,
      order_id: route.params?.order_id
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pedido nº {route.params.number}</Text>
        {items.length === 0 && (
          <TouchableOpacity onPress={handleCloseOrder}>
            <Feather name="trash-2" size={28} color="#FF3F4b" />
          </TouchableOpacity>
        )}
      </View>

      {category.length !== 0 && (
        <TouchableOpacity
          style={styles.input}
          onPress={() => setModalCategoryVisible(true)}
        >
          <Text style={{ color: '#FFF' }}>{categorySelected?.name}</Text>
        </TouchableOpacity>
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productItem}
            onPress={() => {
              setProductSelected(item)
              setModalProductVisible(true)
            }}
          >
            <Text style={styles.productText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { opacity: items.length === 0 ? 0.3 : 1 }]}
          disabled={items.length === 0}
          onPress={handleFinishOrder}
        >
          <Text style={styles.buttonText}>Avançar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, marginTop: 24 }}
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ListItem data={item} deleteItem={handleDeleteItem} />
        )}
      />

      <Modal
        transparent={true}
        visible={modalCategoryVisible}
        animationType="fade"
      >
        <ModalPicker
          handleCloseModal={() => setModalCategoryVisible(false)}
          options={category}
          selectedItem={handleChangeCategory}
        />
      </Modal>

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
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
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
    marginTop: 24
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
    width: '75%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productItem: {
    backgroundColor: '#101026',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  productText: {
    color: '#FFF',
    fontSize: 18
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
  }
})