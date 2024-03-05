import axios from 'axios'

import serverConfig from './server'

export default function createApi(suffix: string) {
  const baseURL = serverConfig.legacyApi + suffix

  return { api: axios.create({ baseURL }), baseURL }
}
