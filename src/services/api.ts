import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pedido-facil-back.vercel.app'
})
export { api }
