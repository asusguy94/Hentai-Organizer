import { FastifyRequest } from 'fastify'

import dayjs from 'dayjs'

import fs from 'fs'
import path from 'path'

export function getUnique<T extends object>(arr: T[], prop: keyof T): T[]
export function getUnique<T>(arr: T[]): T[]
export function getUnique<T>(arr: T[], prop?: keyof T): T[] {
  if (prop !== undefined) {
    return arr.filter((obj, idx) => arr.findIndex(item => item[prop] === obj[prop]) === idx)
  }

  return [...new Set(arr)]
}

export function formatDate(dateStr: string | Date, raw = false) {
  const date = dayjs(dateStr)

  return raw ? date.format('YYYY-MM-DD') : date.format('D MMMM YYYY')
}

function getClosest(search: number, arr: number[]) {
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

export function getClosestQ(quality: number) {
  if (quality === 396) {
    return 480
  }

  return getClosest(quality, [1080, 720, 480, 360])
}

export function getDividableWidth(width: number, limits = { min: 120, max: 240 }): number {
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

async function writeToFile(path: string, content: string) {
  return fs.promises.appendFile(path, content)
}

function calculateTimeCode(seconds: number, timeFormat = 'HH:mm:ss'): string {
  return dayjs(0)
    .hour(0)
    .millisecond(seconds * 1000)
    .format(timeFormat) // use .SSS for milliseconds
}

export async function generateVTTData(
  videoID: number,
  frameDelay: number,
  tiles: { rows: number; cols: number },
  dimension: { height: number; width: number }
) {
  const vtt = `./media/vtt/${videoID}.vtt`

  let nextTimeCode = 0
  const generateTimeCodes = () => {
    const timeCodeFormat = 'HH:mm:ss.SSS'

    const start = calculateTimeCode(nextTimeCode, timeCodeFormat)
    const end = calculateTimeCode(nextTimeCode + frameDelay, timeCodeFormat)

    nextTimeCode += frameDelay

    return { start, end }
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

      // This is required for vidstack to work
      await writeToFile(
        vtt,
        `\n/api/video/${videoID}/vtt/thumb#xywh=${posX},${posY},${dimension.width},${dimension.height}`
      )
      // await writeToFile(vtt, `\nvtt/thumb#xywh=${posX},${posY},${dimension.width},${dimension.height}`)
    }
  }
}

export async function fileExists(path: string): Promise<boolean> {
  return new Promise(resolve => fs.access(path, fs.constants.F_OK, err => resolve(!err)))
}

export async function sendFile(path: string) {
  if (!(await fileExists(path))) {
    return missingFileError
  }

  return new Response(await fs.promises.readFile(path))
}

function response(message: string, statusCode: number): Response
function response(statusCode: number): Response
function response(messageOrstatusCode: string | number, statusCode?: number): Response {
  if (typeof messageOrstatusCode === 'string') {
    return new Response(messageOrstatusCode, { status: statusCode })
  }

  return new Response(null, { status: statusCode })
}

const missingFileError = response('File is missing', 404)

export const noExt = (dir: string) => path.parse(dir).name
export const dirOnly = (dir: string) => path.parse(dir).name
export const extOnly = (dir: string) => path.parse(dir).ext

export function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function downloader(url: string, path: string) {
  const response = await fetch(url)
  const buffer = new Uint8Array(await response.arrayBuffer())

  await fs.promises.writeFile(`./${path}`, buffer)
}

export async function sendPartial(req: FastifyRequest, path: string, mb = 2) {
  const chunkSize = 1024 * 1024 * mb

  if (!(await fileExists(path))) {
    return missingFileError
  }

  return new Promise<Response>((resolve, reject) => {
    fs.stat(path, (err, data) => {
      if (err) throw err

      // extract start and end / empty
      const ranges = req.headers.range?.match(/^bytes=(\d+)-/)?.slice(1)

      const start = parseInt(ranges?.at(0) ?? '0')
      const end = Math.min(start + chunkSize, data.size - 1)

      const stream = fs.createReadStream(path, { start, end })
      const buffer: Buffer[] = []

      stream.on('data', (chunk: Buffer) => buffer.push(chunk))
      stream.on('end', () => {
        resolve(
          new Response(Buffer.concat(buffer), {
            status: 206,
            headers: {
              'Accept-Ranges': 'bytes',
              'Content-Range': `bytes ${start}-${end}/${data.size}`,
              'Content-Length': `${end - start + 1}`
            }
          })
        )
      })
      stream.on('error', error => reject(error))
    })
  })
}

export async function removePreviews(videoID: number) {
  await Promise.allSettled([
    fs.promises.unlink(`./media/vtt/${videoID}.vtt`),
    fs.promises.unlink(`./media/vtt/${videoID}.jpg`)
  ])
}

export async function removePoster(videoID: number) {
  try {
    await fs.promises.unlink(`./media/images/videos/poster/${videoID}.png`)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err
    }
  }
}

export async function removeCover(videoID: number) {
  try {
    await fs.promises.unlink(`./media/images/videos/cover/${videoID}.png`)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err
    }
  }
}
