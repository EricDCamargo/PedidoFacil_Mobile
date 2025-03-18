import React from 'react'
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native'

import ListItem from '../ListItem'
import { OrderDetails } from '@/src/types'

type FinishOrderModalProps = {
  visible: boolean
  onClose: () => void
  currentOrder: OrderDetails | undefined
  handleFinishOrder: () => void
  handleDeleteItem: (item_id: string) => void
}

export default function FinishOrderModal({
  visible,
  onClose,
  currentOrder,
  handleFinishOrder,
  handleDeleteItem
}: FinishOrderModalProps) {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Itens do Pedido</Text>
          <FlatList
            data={currentOrder?.items}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ListItem item={item} deleteItem={handleDeleteItem} />
            )}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.finishButton,
                { opacity: currentOrder?.items.length ? 1 : 0.3 }
              ]}
              disabled={!currentOrder?.items.length}
              onPress={handleFinishOrder}
            >
              <Text style={styles.buttonText}>Finalizar Pedido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    elevation: 5
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginRight: 5
  },
  finishButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginLeft: 5
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
