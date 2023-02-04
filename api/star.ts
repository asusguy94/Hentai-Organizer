import axios from 'axios'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/star`
})

export default {
  getInfo: () => {
    return api.get<{
      breast: string[]
      haircolor: string[]
      hairstyle: string[]
      attribute: string[]
    }>('/')
  }
}
