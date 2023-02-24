import generatePreview from 'ffmpeg-generate-video-preview'
import getDimensions from 'get-video-dimensions'
import ffmpeg from 'fluent-ffmpeg'

import { generateVTTData, getDividableWidth } from './helper'

/**
 * Get the duration of a video
 * @param file video file
 * @return duration as seconds
 */
const getRawDuration = async (file: string) => {
  return new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, metadata) => {
      if (err) {
        reject(err)
        return
      }

      const duration = metadata.format.duration
      if (duration === undefined) {
        reject('Duration is undefined')
      } else {
        resolve(duration)
      }
    })
  })
}

/**
 * Get the height of a video
 * @param file video file
 * @return height in pixels
 */
const getRawHeight = async (file: string) => (await getDimensions(file)).height

/**
 * Get the width of a video
 * @param file video file
 * @return height in pixels
 */
const getRawWidth = async (file: string) => (await getDimensions(file)).width

/**
 * Helper method for getting video-duration
 * @param file
 */
export const getDuration = async (file: string) => Math.round(await getRawDuration(file))

/**
 * Helper method for getting video-height
 * @param file
 */
export const getHeight = async (file: string) => await getRawHeight(file)

export const extractVtt = async (src: string, dest: string, videoID: number) => {
  const duration = await getDuration(src) // in seconds
  const delayBetweenFrames = calculateDelay(duration) // in seconds (new frame every THIS seconds)

  const cols = 8 // images per row
  const rows = Math.floor(Math.floor(duration / delayBetweenFrames) / cols)

  /* Generate Preview */
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
