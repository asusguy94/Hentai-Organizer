import { dirOnly } from './helper'

const bonusRegex = / (bonus|special|extra)\b/i
const episodeRegex = / (episode)\b/i

/**
 * Check if video is a bonus episode
 * @param fname episode string
 */
const isBonusEpisode = (fname: string) => bonusRegex.test(fname)

/**
 * Create franchise from video-path
 * @param path path to a video-file
 * @return video franchise
 */
export const generateFranchise = (path: string) => {
  const fname = dirOnly(path)

  let match: string
  if (isBonusEpisode(fname)) {
    match = fname.split(bonusRegex)[0]
  } else {
    match = fname.split(episodeRegex)[0]
  }

  return match.trim()
}

/**
 * Create name from video-path
 * @param path path to a video-file
 * @return video name
 */
export const generateName = (path: string) => dirOnly(path)

/**
 * Create episode number from video-path
 * @param path path to a video-file
 * @return episode number
 */
export const generateEpisode = (path: string) => {
  const fname = dirOnly(path)

  let match: string
  if (isBonusEpisode(fname)) {
    // FIXME might cause error when multiple bonus episodes in same franchise
    match = '99' // Set bonus episode to high number
  } else {
    const matchArr = fname.split(episodeRegex)
    match = matchArr[matchArr.length - 1]
  }

  return parseInt(match.trim())
}
