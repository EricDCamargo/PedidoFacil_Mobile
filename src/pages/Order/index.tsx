import React, { useState, useEffect } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { api } from '../../services/api'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { StackPramsList } from '../../routes/app.routes'
import { Ionicons } from '@expo/vector-icons'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  price: string
  category_id: string
}

interface RouteParams {
  number: string
  order_id: string
}

export default function Order() {
  const route = useRoute()
  const { number, order_id } = route.params as RouteParams
  const navigation = useNavigation<NativeStackNavigationProp<StackPramsList>>()

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.get('/category')
        setCategories(response.data.data)
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      }
    }
    loadCategories()
  }, [])

  async function selectCategory(categoryId: string) {
    try {
      const response = await api.get(
        `/category/product?category_id=${categoryId}`
      )
      setProducts(response.data.data)
      setSelectedCategory(categoryId)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    }
  }

  function handleBack() {
    setSelectedCategory(null)
    setSearch('')
  }

  async function handleCancelOrder() {
    try {
      await api.delete(`/order?order_id=${order_id}`)
      Alert.alert('Sucesso', 'Pedido cancelado com sucesso.')
      navigation.navigate('Dashboard')
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível cancelar o pedido.')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {selectedCategory ? 'Produtos' : 'Categorias'}
        </Text>
        <TouchableOpacity
          onPress={handleCancelOrder}
          style={styles.cancelButton}
        >
          <Ionicons name="close-circle" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {selectedCategory ? (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Pesquisar produto..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item}>
                <Text style={styles.itemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => selectCategory(item.id)}
            >
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
  cancelButton: {
    backgroundColor: '#ff3b30',
    padding: 10,
    borderRadius: 50
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#333',
    paddingHorizontal: 10,
    borderRadius: 8
  },
  input: {
    flex: 1,
    height: 40,
    color: '#FFF'
  },
  item: {
    flex: 1,
    backgroundColor: '#3fffa3',
    padding: 15,
    margin: 5,
    borderRadius: 8,
    alignItems: 'center'
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#101026'
  }
})
