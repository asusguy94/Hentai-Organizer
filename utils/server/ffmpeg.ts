import generatePreview from 'ffmpeg-generate-video-preview'
import getDimensions from 'get-video-dimensions'
import { getVideoDurationInSeconds } from 'get-video-duration'

import { generateVTTData, getDividableWidth } from './helper'

/**
 * Get the duration of a video
 * @param file video file
 * @return duration as seconds
 */
const getDuration = async (file: string) => Math.round(await getVideoDurationInSeconds(file))

/**
 * Get the height of a video
 * @param file video file
 * @return height in pixels
 */
const getHeight = async (file: string) => (await getDimensions(file)).height

/**
 * Get the width of a video
 * @param file video file
 * @return height in pixels
 */
const getWidth = async (file: string) => (await getDimensions(file)).width

/**
 * Helper method for getting video-duration
 * @param file
 */
export const duration = async (file: string) => await getDuration(file)

/**
 * Helper method for getting video-height
 * @param file
 */
export const height = async (file: string) => await getHeight(file)

const calculateDelay = (duration: number) => {
  if (duration > 60 * 60) {
    return 10
  } else if (duration > 20 * 60) {
    //20m-60m
    return 5
  } else if (duration > 5 * 60) {
    //5m-20m
    return 2
  } else {
    //0-5m
    return 1
  }
}

export const extractVtt = async (src: string, dest: string, videoID: number) => {
  const duration = await getDuration(src) // in seconds
  const delayBetweenFrames = calculateDelay(duration) // in seconds (new frame every THIS seconds)

  const cols = 8 // images per row
  const rows = Math.floor(Math.floor(duration / delayBetweenFrames) / cols)

  /* Generate Preview */
  console.log(`Creating a preview with ${cols * rows} frames`)
  const {
    width: calcWidth,
    height: calcHeight,
    rows: numRows,
    cols: numCols
  } = await generatePreview({
    input: src,
    output: dest,
    width: getDividableWidth({ min: 80, max: 160 }, await getWidth(src)),
    quality: 6,
    rows: rows,
    cols: cols
  })

  /* Generate VTT output */
  await generateVTTData(
    videoID,
    delayBetweenFrames,
    { rows: numRows, cols: numCols },
    {
      width: calcWidth,
      height: calcHeight
    }
  )
}
