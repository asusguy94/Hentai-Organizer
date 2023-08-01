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
  slug: string | null
  poster: string | null
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
  category: (string | null)[]
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

type HiddenType = HiddenStar | HiddenVideo
type ObjectType = StarSearch | VideoSearch

export const isHiddenVideo = (hidden: HiddenVideo | HiddenStar): hidden is HiddenVideo => 'brand' in hidden
export const isHiddenStar = (hidden: HiddenVideo | HiddenStar): hidden is HiddenStar => 'breast' in hidden
const isVideo = (video: VideoSearch | StarSearch): video is VideoSearch => 'cen' in video
const isStar = (star: VideoSearch | StarSearch): star is StarSearch => 'videos' in star

function isTitleVisible(obj: ObjectType, hidden: HiddenType) {
  return obj.name.toLowerCase().includes(hidden.titleSearch)
}

function isBreastVisible(star: StarSearch, hidden: HiddenStar) {
  // hidden is empty
  if (hidden.breast.length === 0) return true

  // star has no breast
  if (star.breast === null) return false

  // hidden is not empty
  return hidden.breast === star.breast.toLowerCase()
}

function isHaircolorVisible(star: StarSearch, hidden: HiddenStar) {
  // hidden is empty
  if (hidden.haircolor.length === 0) return true

  // star has no haircolor
  if (star.haircolor === null) return false

  // hidden is not empty
  return hidden.haircolor === star.haircolor.toLowerCase()
}

function isHairstyleVisible(star: StarSearch, hidden: HiddenStar) {
  // hidden is empty
  if (hidden.hairstyle.length === 0) return true

  // star has no hairstyle
  if (star.hairstyle === null) return false

  // hidden is not empty
  return hidden.hairstyle === star.hairstyle.toLowerCase()
}

function isAttributeVisible(video: VideoSearch, hidden: HiddenVideo): boolean
function isAttributeVisible(star: StarSearch, hidden: HiddenStar): boolean
function isAttributeVisible(obj: ObjectType, hidden: HiddenType) {
  const attributes = obj.attributes.map(attr => attr.toLowerCase())

  // hidden is empty
  if (hidden.attribute.length === 0) return true

  // hidden is not empty
  return hidden.attribute.every(attr => attributes.includes(attr))
}

function isCategoryVisible(video: VideoSearch, hidden: HiddenVideo) {
  const categories = video.categories.map(cat => cat.toLowerCase())

  // category is null
  if (hidden.category.length > 0 && hidden.category.includes(null)) {
    // hidden and !hidden should always be hidden
    if (hidden.category.length > 1) {
      return false
    }

    // videois hown if unrated
    return video.categories.length === 0
  }

  // hidden is empty
  if (hidden.category.length === 0) return true

  // hidden is not empty
  return hidden.category.every(cat => cat !== null && categories.includes(cat.toLowerCase()))
}

function isCenVisible(video: VideoSearch, hidden: HiddenVideo) {
  // hidden is empty
  if (hidden.cen === null) return true

  // hidden is not empty
  return video.cen === hidden.cen
}

function isBrandVisible(video: VideoSearch, hidden: HiddenVideo) {
  // hidden is empty
  if (hidden.brand.length === 0) return true

  // star has no brand
  if (video.brand === null) return false

  // hidden is not empty,
  return video.brand.toLowerCase() === hidden.brand
}

function isOutfitVisible(video: VideoSearch, hidden: HiddenVideo) {
  const outfits = video.outfits.map(outfit => outfit.toLowerCase())

  // hidden is empty
  if (hidden.outfit.length === 0) return true

  // hidden is not empty
  return hidden.outfit.every(outfit => outfits.includes(outfit))
}

function isStarHidden(star: StarSearch, hidden: HiddenStar) {
  return !(
    isTitleVisible(star, hidden) &&
    isBreastVisible(star, hidden) &&
    isHaircolorVisible(star, hidden) &&
    isHairstyleVisible(star, hidden) &&
    isAttributeVisible(star, hidden)
  )
}

function isVideoHidden(video: VideoSearch, hidden: HiddenVideo) {
  return !(
    isTitleVisible(video, hidden) &&
    isCenVisible(video, hidden) &&
    isBrandVisible(video, hidden) &&
    isCategoryVisible(video, hidden) &&
    isAttributeVisible(video, hidden) &&
    isOutfitVisible(video, hidden)
  )
}

export function isHidden(video: VideoSearch, hidden: HiddenVideo): boolean
export function isHidden(star: StarSearch, hidden: HiddenStar): boolean
export function isHidden(obj: ObjectType, hidden: HiddenType) {
  if (isVideo(obj) && isHiddenVideo(hidden)) {
    return isVideoHidden(obj, hidden)
  } else if (isStar(obj) && isHiddenStar(hidden)) {
    return isStarHidden(obj, hidden)
  }
}

function getVisibleStars(stars: StarSearch[], hidden: HiddenStar) {
  return stars.filter(star => !isStarHidden(star, hidden))
}
function getVisibleVideos(videos: VideoSearch[], hidden: HiddenVideo) {
  return videos.filter(video => !isVideoHidden(video, hidden))
}

export function getVisible(videos: VideoSearch[], hidden: HiddenVideo): VideoSearch[]
export function getVisible(stars: StarSearch[], hidden: HiddenStar): StarSearch[]
export function getVisible(arr: ObjectType[], hidden: HiddenType) {
  if (isHiddenVideo(hidden)) {
    return getVisibleVideos(arr as VideoSearch[], hidden)
  }

  return getVisibleStars(arr as StarSearch[], hidden)
}
