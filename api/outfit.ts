import axios from 'axios'

import { General } from '@interfaces'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/outfit`
})

export default {
  getAll: () => api.get<General[]>('/')
}
