import generatePreview from 'ffmpeg-generate-video-preview'
import ffmpeg from 'fluent-ffmpeg'
import getDimensions from 'get-video-dimensions'

import fs from 'fs'
import path from 'path'

import { generateVTTData, getDividableWidth } from './'

/**
 * Get the duration of a video
 * @param file video file
 * @return duration as seconds
 */
async function getRawDuration(file: string) {
  return new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, metadata) => {
      if (err) {
        reject(err as Error)
        return
      }

      const duration = metadata.format.duration
      if (duration === undefined) {
        reject(new Error('Duration is undefined'))
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

export async function extractVtt(src: string, dest: string, videoID: number) {
  const duration = await getRawDuration(src) // in seconds

  const cols = 8 // images per row
  const rows = 40 // images per column

  const delay = duration / (rows * cols)

  /* Generate Preview */
  const {
    width: calcWidth,
    height: calcHeight,
    rows: numRows,
    cols: numCols
  } = await generatePreview({
    input: src,
    output: dest,
    width: getDividableWidth(await getRawWidth(src)),
    quality: 4,
    rows: rows,
    cols: cols
  })

  /* Generate VTT output */
  await generateVTTData(
    videoID,
    delay,
    { rows: numRows, cols: numCols },
    {
      width: calcWidth,
      height: calcHeight
    }
  )
}

// This requires a specific pipeline, as such it is using callbacks
export async function rebuildVideoFile(src: string) {
  const { dir, ext, name } = path.parse(src)
  const newSrc = `${dir}/${name}_${ext}`

  await fs.promises.rename(src, newSrc)
  return new Promise<boolean>((resolve, reject) => {
    ffmpeg(newSrc)
      .videoCodec('copy')
      .audioCodec('copy')
      .output(src)
      .on('end', () => fs.unlink(newSrc, err => resolve(err !== null)))
      .on('error', err => reject(err as Error))
      .run()
  })
}
