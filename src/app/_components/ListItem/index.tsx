import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { OrderItem } from '@/src/types'

interface ItemProps {
  item: OrderItem
  deleteItem: (item_id: string) => void
}

export default function ListItem({ item, deleteItem }: ItemProps) {
  function handleDeleteItem() {
    deleteItem(item.id)
  }
  console.log(item)
  if (item) {
    return (
      <View style={styles.container}>
        <Text style={styles.item}>
          {item.amount} - {item.product.name} - {item.observation}
        </Text>

        <TouchableOpacity onPress={handleDeleteItem}>
          <Feather name="trash-2" color="#FF3F4b" size={25} />
        </TouchableOpacity>
      </View>
    )
  }
  return null
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#101026',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 0.3,
    borderColor: '#8a8a8a'
  },
  item: {
    color: '#FFF'
  }
})
