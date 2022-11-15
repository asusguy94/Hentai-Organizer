import axios from 'axios'

import { IGeneral } from '@interfaces'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/outfit`
})

export default {
  getAll: async () => api.get<IGeneral[]>('/')
}
