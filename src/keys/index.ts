import { mergeQueryKeys } from '@lukemorales/query-key-factory'

import { attributes } from './attribute'
import { categories } from './category'
import { outfits } from './outfit'
import { search } from './search'
import { stars } from './star'
import { videos } from './video'

export const keys = mergeQueryKeys(videos, stars, search, attributes, outfits, categories)
