import type { NextApiRequest, NextApiResponse } from 'next/types'

import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'

import dayjs from 'dayjs'

import { settingsConfig } from '@config'

/**
 * Get the closest number from an array of numbers
 * @param search the search number
 * @param arr the array of numbers to search
 * @return the closest number
 */
const getClosest = (search: number, arr: number[]) => {
  return arr.reduce((a, b) => {
    const aDiff = Math.abs(a - search)
    const bDiff = Math.abs(b - search)

    if (aDiff === bDiff) {
      return a > b ? a : b
    } else {
      return bDiff < aDiff ? b : a
    }
  })
}

/**
 * Download a file
 * @param url the source path
 * @param path the destination path
 */
export const downloader = async (url: string, path: string) => {
  const response = await fetch(url)
  const buffer = await response.buffer()
  await fs.promises.writeFile(`./${path}`, buffer)
}

export const getUnique = <T>(arr: T[], prop?: keyof T): T[] => {
  if (prop !== undefined) {
    return arr.filter((obj, idx) => arr.findIndex(item => item[prop] === obj[prop]) === idx)
  }

  return [...new Set(arr)]
}

/**
 * Append Text to file
 * @param path file to be written to
 * @param content text to write to file
 */
const writeToFile = async (path: string, content: string) => fs.promises.appendFile(path, content)

/**
 * Get the directory of a path
 * @param dir
 */
export const dirOnly = (dir: string) => path.parse(dir).name

/**
 * Get the extension of a path
 * @param dir
 */
export const extOnly = (dir: string) => path.parse(dir).ext

/**
 * Get the filename without extension
 * @param dir
 */
export const noExt = (dir: string) => path.parse(dir).name

/**
 * Remove thumbnail from a given 'id'
 * @param videoID
 */
export const removeCover = async (videoID: number) => {
  // Remove Images
  await fs.promises.unlink(`./media/images/videos/${videoID}.png`)
}

export const removePreviews = async (videoID: number) => {
  // Remove Previews
  await Promise.allSettled([
    fs.promises.unlink(`./media/vtt/${videoID}.vtt`),
    fs.promises.unlink(`./media/vtt/${videoID}.jpg`)
  ])
}

// This requires a specific pipeline, as such it is using callbacks
export const rebuildVideoFile = async (src: string) => {
  const { dir, ext, name } = path.parse(src)
  const newSrc = `${dir}/${name}_${ext}`

  return new Promise<boolean>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/require-await
    fs.promises.rename(src, newSrc).then(async () => {
      ffmpeg(newSrc)
        .videoCodec('copy')
        .audioCodec('copy')
        .output(src)
        .on('end', () => fs.unlink(newSrc, err => resolve(err !== null)))
        .on('error', err => reject(err))
        .run()
    })
  })
}

/**
 * Get the closest quality level
 * @param quality
 * @return the closest quality
 */
export const getClosestQ = (quality: number) => {
  if (quality === 396) {
    return 480
  }

  return getClosest(quality, settingsConfig.qualities)
}

/**
 * Determine if a file exists
 * @param path the source path to check
 */
export const fileExists = async (path: string): Promise<boolean> => {
  return new Promise(resolve => fs.access(path, fs.constants.F_OK, err => resolve(!err)))
}

/**
 * Format a date in 2 ways
 * @param dateStr a string containing a date
 * @param raw should the raw date be returned?
 */
export const formatDate = (dateStr: string | Date, raw = false) => {
  const date = dayjs(dateStr)

  return raw ? date.format('YYYY-MM-DD') : date.format('D MMMM YYYY')
}

const calculateTime = (secs: number) =>
  dayjs(0)
    .hour(0)
    .millisecond(secs * 1000)

export const generateVTTData = async (
  videoID: number,
  frameDelay: number,
  tiles: { rows: number; cols: number },
  dimension: { height: number; width: number }
) => {
  const vtt = `./media/vtt/${videoID}.vtt`

  let nextTimeCode = 0
  const generateTimeCodes = () => {
    const timeCodeFormat = 'HH:mm:ss.SSS'

    const start = calculateTime(nextTimeCode)
    const end = calculateTime(nextTimeCode + frameDelay)

    nextTimeCode += frameDelay

    return {
      start: start.format(timeCodeFormat),
      end: end.format(timeCodeFormat)
    }
  }

  await writeToFile(vtt, 'WEBVTT')
  for (let row = 0, counter = 0; row < tiles.rows; row++) {
    const posY = row * dimension.height
    for (let col = 0; col < tiles.cols; col++) {
      const posX = col * dimension.width

      const { start, end } = generateTimeCodes()

      await writeToFile(vtt, '\n')
      await writeToFile(vtt, `\n${++counter}`)
      await writeToFile(vtt, `\n${start} --> ${end}`)
      await writeToFile(vtt, `\nvtt/thumb#xywh=${posX},${posY},${dimension.width},${dimension.height}`)
    }
  }
}

export const getDividableWidth = (width: number, limits = { min: 120, max: 240 }): number => {
  const MIN = 10 * 2
  const MAX = width / 2

  const increment = 10
  for (let dividend = limits.max; dividend >= limits.min; dividend--) {
    if (width % dividend === 0) return dividend
  }

  // Check if calculation is out-of-bounds
  if (limits.max + increment < MAX || limits.min - increment > MIN) {
    if (limits.max + increment < MAX) {
      limits.max += increment
    }

    if (limits.min - increment > MIN) {
      limits.min -= increment
    }

    return getDividableWidth(width, limits)
  }
  throw new Error(`Could not find dividable width for ${width}`)
}

/**
 * @param {string} path the path of video/image
 * @return {{isVideo: boolean, isImage:boolean}} Returns an object with isImage and isVideo
 */
const getFileType = (path: string): { isVideo: boolean; isImage: boolean } => {
  if (process.env.NODE_ENV === 'production') {
    return { isImage: false, isVideo: false }
  }

  const isVideo = extOnly(path) === '.mp4'
  const isImage = ['.jpg', '.png'].includes(extOnly(path))
  if (isVideo && isImage) throw new Error('Invalid image/video type')

  return { isVideo, isImage }
}

const getSampleFiles = () => ({ video: './public/video.mp4', image: './public/image.jpg' })

export const sendFile = async (res: NextApiResponse, path: string) => {
  if (!(await fileExists(path))) {
    const { isImage, isVideo } = getFileType(path)

    if (isVideo) {
      path = getSampleFiles().video
    } else if (isImage) {
      path = getSampleFiles().image
    } else {
      res.status(404).end()
      return
    }
  }

  res.writeHead(200)
  fs.createReadStream(path).pipe(res)
}

export const sendPartial = async (req: NextApiRequest, res: NextApiResponse, path: string, mb = 2): Promise<void> => {
  const chunkSize = 1024 * 1024 * mb

  if (!(await fileExists(path))) {
    const { isVideo } = getFileType(path)

    if (isVideo) {
      path = getSampleFiles().video
    } else {
      res.status(404).end()
      return
    }
  }

  fs.stat(path, (err, data) => {
    if (err) {
      throw err
    }

    if (req.headers.range !== undefined) {
      const range = req.headers.range

      // extract start and end / empty
      const ranges = range.match(/^bytes=(\d+)-(.*)$/)?.slice(1, 2)
      if (ranges !== undefined) {
        const start = parseInt(ranges[0])
        const end = Math.min(start + chunkSize, data.size - 1)

        res.writeHead(206, {
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${start}-${end}/${data.size}`,
          'Content-Length': end - start + 1,
          'Content-Type': 'video/mp4'
        })

        fs.createReadStream(path, { start, end }).pipe(res)
      }
    }
  })
}
