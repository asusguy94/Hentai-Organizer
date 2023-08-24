import axios from 'axios'
import crypto from 'crypto'
import UserAgent from 'fake-useragent'

const BASE_URL = 'https://hanime.tv/api/v8'

async function jsongen<T>(url: string): Promise<T> {
  try {
    const headers = {
      'X-Signature-Version': 'web2',
      'X-Signature': crypto.randomBytes(32).toString('hex'),
      'User-Agent': new UserAgent().random
    }
    const res = await axios.get<T>(url, { headers })

    return res.data
  } catch (error) {
    throw new Error(`Error fetching data: ${(error as Error).message}`)
  }
}

export async function getVideo(slug: string) {
  type Hentai = {
    hentai_video: {
      id: number
      name: string
      brand: string
      released_at: string
      released_at_unix: number
      poster_url: string
      cover_url: string
    }
    hentai_franchise: {
      title: string
    }
    hentai_franchise_hentai_videos: {
      id: number
      name: string
      slug: string
      poster_url: string
      cover_url: string
    }[]
  }

  const videoDataUrl = `${BASE_URL}/video?id=${slug}`
  const videoData = await jsongen<Hentai>(videoDataUrl)

  const franchise = videoData.hentai_franchise_hentai_videos
    .find(video => video.id === videoData.hentai_video.id)
    ?.name.replace(/ \d+$/, '')

  const videoName = videoData.hentai_video.name
  const jsondata = {
    raw: videoData,
    name: videoName,
    brand: videoData.hentai_video.brand,
    released: { date: videoData.hentai_video.released_at, unix: videoData.hentai_video.released_at_unix },
    poster: videoData.hentai_video.poster_url,
    cover: videoData.hentai_video.cover_url,
    franchise: franchise ?? videoData.hentai_franchise.title,
    related: videoData.hentai_franchise_hentai_videos
      .filter(video => video.name !== videoName) // filter out the current video
      .map(({ slug, cover_url: cover, poster_url: poster }) => ({ slug, cover, poster }))
  }

  return jsondata
}
