import { getCookieClient } from '../lib/cookieClient'
import { debug, api } from './api'
import { ENVIRONMENT } from '@env'

const { debugError, debugSuccess } = debug
const environment = ENVIRONMENT
interface ResponsePromise {
  [x: string]: any
  data: any | Array<any>
  message: string
  status: number
  isOk: boolean
}

export const serviceConsumer = () => ({
  //Get Method
  executeGet: async function (url: string, params?: any) {
    return await this.executeService('GET', url, params)
  },

  //Post Method
  executePost: async function (url: string, body: FormData | any | Array<any>) {
    return await this.executeService('POST', url, '', body)
  },

  //Put Method
  executePut: async function (
    url: string,
    params?: any,
    body?: FormData | any | Array<any>
  ) {
    return await this.executeService('PUT', url, params, body)
  },

  //Delete
  executeDelete: async function (url: string, params?: any) {
    return await this.executeService('DELETE', url, params)
  },

  executeService: async function (
    method: 'GET' | 'POST' | 'DELETE' | 'PUT',
    url: string,
    params?: any,
    data?: FormData | any | Array<any>
  ): Promise<ResponsePromise> {
    let headers: Record<string, string> = {
      Authorization: `Bearer ${await getCookieClient()}`
    }
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    let response

    response = api({
      method,
      url,
      params,
      headers,
      data
    })
      .then(res => {
        const { data, status } = res
        const successResponse: ResponsePromise = {
          data: data.data,
          status: status,
          message: data.message,
          isOk: true
        }
        if (environment === 'dev') {
          debugSuccess('-------- DEBUG - SUCCESS - START --------')
          console.log(successResponse)
          debugSuccess('-------- DEBUG - SUCCESS - END --------')
        }
        return successResponse
      })
      .catch(err => {
        const { response, status } = err
        const errorResponse: ResponsePromise = {
          data: [],
          status: status,
          message: response?.data?.error,
          isOk: false
        }
        if (environment === 'dev') {
          debugError('-------- DEBUG - ERROR - START --------')
          console.log(errorResponse)
          debugError('-------- DEBUG - ERROR - END --------')
        }
        return errorResponse
      })

    return response
  }
})
