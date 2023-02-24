export type StarSearch = {
  id: number
  name: string
  image: string | null
  breast: string | null
  haircolor: string | null
  hairstyle: string | null
  attributes: string[]
  videos: {
    total: number
    last: string | null
  }
}

export type VideoSearch = {
  id: number
  name: string
  franchise: string
  brand: string | null
  noStar: boolean
  cen: boolean
  cover: string | null
  published: string | null
  quality: number
  plays: number
  attributes: string[]
  categories: string[]
  outfits: string[]
}
export type HiddenVideo = {
  titleSearch: string
  cen: boolean | null
  brand: string
  category: string[]
  attribute: string[]
  outfit: string[]
}
export type HiddenStar = {
  titleSearch: string
  breast: string
  haircolor: string
  hairstyle: string
  attribute: string[]
}

export const isHiddenVideo = (hidden: HiddenVideo | HiddenStar): hidden is HiddenVideo => 'brand' in hidden
export const isHiddenStar = (hidden: HiddenVideo | HiddenStar): hidden is HiddenStar => 'breast' in hidden
const isVideo = (video: VideoSearch | StarSearch): video is VideoSearch => 'cen' in video
const isStar = (star: VideoSearch | StarSearch): star is StarSearch => 'videos' in star

const isTitleHidden = (obj: VideoSearch | StarSearch, hidden: HiddenStar | HiddenVideo) => {
  return obj.name.toLowerCase().includes(hidden.titleSearch)
}

const isBreastHidden = (star: StarSearch, hidden: HiddenStar) => {
  // hidden is empty
  if (hidden.breast.length === 0) return true

  // star has no breast
  if (star.breast === null) return false

  // hidden is not empty
  return hidden.breast === star.breast.toLowerCase()
}

const isHaircolorHidden = (star: StarSearch, hidden: HiddenStar) => {
  // hidden is empty
  if (hidden.haircolor.length === 0) return true

  // star has no haircolor
  if (star.haircolor === null) return false

  // hidden is not empty
  return hidden.haircolor === star.haircolor.toLowerCase()
}

const isHairstyleHidden = (star: StarSearch, hidden: HiddenStar) => {
  // hidden is empty
  if (hidden.hairstyle.length === 0) return true

  // star has no hairstyle
  if (star.hairstyle === null) return false

  // hidden is not empty
  return hidden.hairstyle === star.hairstyle.toLowerCase()
}

function isAttributeHidden(video: VideoSearch, hidden: HiddenVideo): boolean
function isAttributeHidden(star: StarSearch, hidden: HiddenStar): boolean
function isAttributeHidden(obj: VideoSearch | StarSearch, hidden: HiddenVideo | HiddenStar) {
  const attributes = obj.attributes.map(attr => attr.toLowerCase())

  // hidden is empty
  if (hidden.attribute.length === 0) return true

  // hidden is not empty
  return hidden.attribute.every(attr => attributes.includes(attr))
}

const isCategoryHidden = (video: VideoSearch, hidden: HiddenVideo) => {
  const categories = video.categories.map(cat => cat.toLowerCase())

  // hidden is empty
  if (hidden.category.length === 0) return true

  // hidden is not empty
  return hidden.category.every(cat => categories.includes(cat))
}

const isCenHidden = (video: VideoSearch, hidden: HiddenVideo) => {
  // hidden is empty
  if (hidden.cen === null) return true

  // hidden is not empty
  return video.cen === hidden.cen
}

const isBrandHidden = (video: VideoSearch, hidden: HiddenVideo) => {
  // hidden is empty
  if (hidden.brand.length === 0) return true

  // star has no brand
  if (video.brand === null) return false

  // hidden is not empty,
  return video.brand.toLowerCase() === hidden.brand
}

const isOutfitHidden = (video: VideoSearch, hidden: HiddenVideo) => {
  const outfits = video.outfits.map(outfit => outfit.toLowerCase())

  // hidden is empty
  if (hidden.outfit.length === 0) return true

  // hidden is not empty
  return hidden.outfit.every(outfit => outfits.includes(outfit))
}

const isStarHidden = (star: StarSearch, hidden: HiddenStar) => {
  return !(
    isTitleHidden(star, hidden) &&
    isBreastHidden(star, hidden) &&
    isHaircolorHidden(star, hidden) &&
    isHairstyleHidden(star, hidden) &&
    isAttributeHidden(star, hidden)
  )
}

const isVideoHidden = (video: VideoSearch, hidden: HiddenVideo) => {
  return !(
    isTitleHidden(video, hidden) &&
    isCenHidden(video, hidden) &&
    isBrandHidden(video, hidden) &&
    isCategoryHidden(video, hidden) &&
    isAttributeHidden(video, hidden) &&
    isOutfitHidden(video, hidden)
  )
}

export function isHidden(video: VideoSearch, hidden: HiddenVideo): boolean
export function isHidden(star: StarSearch, hidden: HiddenStar): boolean
export function isHidden(obj: VideoSearch | StarSearch, hidden: HiddenVideo | HiddenStar) {
  if (isVideo(obj) && isHiddenVideo(hidden)) {
    return isVideoHidden(obj, hidden)
  } else if (isStar(obj) && isHiddenStar(hidden)) {
    return isStarHidden(obj, hidden)
  }
}

const getVisibleStars = (stars: StarSearch[], hidden: HiddenStar) => {
  return stars.filter(star => !isStarHidden(star, hidden))
}
const getVisibleVideos = (videos: VideoSearch[], hidden: HiddenVideo) => {
  return videos.filter(video => !isVideoHidden(video, hidden))
}

export function getVisible(videos: VideoSearch[], hidden: HiddenVideo): VideoSearch[]
export function getVisible(stars: StarSearch[], hidden: HiddenStar): StarSearch[]
export function getVisible(arr: VideoSearch[] | StarSearch[], hidden: HiddenVideo | HiddenStar) {
  if (isHiddenVideo(hidden)) {
    return getVisibleVideos(arr as VideoSearch[], hidden)
  }

  return getVisibleStars(arr as StarSearch[], hidden)
}
