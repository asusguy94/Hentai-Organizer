import axios from 'axios'

import { serverConfig } from '@config'

const baseURL = `${serverConfig.api}/bookmark`
const api = axios.create({ baseURL })

export default {
  removeBookmark: (id: number) => api.delete(`/${id}`),
  setCategory: (id: number, categoryID: number) => api.put(`/${id}`, { categoryID }),
  setOutfit: (id: number, outfitID: number) => api.put(`/${id}/outfit`, { outfitID }),
  removeOutfit: (id: number) => api.delete(`/${id}/outfit`),
  addAttribute: (id: number, attributeID: number) => api.post('/attribute', { bookmarkID: id, attributeID }),
  removeAttribute: (id: number, attributeID: number) => api.delete(`/${id}/attribute/${attributeID}`),
  clearAttributes: (id: number) => api.delete(`/${id}/attribute`),
  removeStar: (id: number) => api.delete(`/${id}/star`),
  setTime: (id: number, time: number) => api.put(`/${id}`, { time }),
  addStar: (id: number, starID: number) => api.post(`/${id}/star`, { starID }),
  addStarAttribute: (videoID: number, starID: number, attributeID: number) => {
    return api.post('/attribute', { videoID, starID, attributeID })
  }
}
