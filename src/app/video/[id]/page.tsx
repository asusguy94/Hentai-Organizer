import Client from './client'

import { Params } from '@interfaces'
import { getVideo } from '@utils/server/hanime'
import { dirOnly, formatDate, noExt } from '@utils/server/helper'
import prisma from '@utils/server/prisma'
import { escapeRegExp, getUnique } from '@utils/shared'

export default async function VideoPage({ params }: Params<'id'>) {
  const id = parseInt(params.id)

  const video = await prisma.video.findFirstOrThrow({ where: { id } })
  const outfits = await prisma.outfit.findMany({ orderBy: { name: 'asc' } })

  const stars = await prisma.star.findMany({
    where: { videos: { some: { videoID: id } } },
    select: {
      id: true,
      name: true,
      image: true,
      attributes: { select: { attribute: { select: { id: true, name: true } } } }
    }
  })

  const bookmarks = await prisma.bookmark.findMany({
    where: { videoID: id },
    orderBy: { start: 'asc' },
    select: {
      id: true,
      start: true,
      category: true,
      outfit: true,
      attributes: { include: { attribute: { select: { id: true, name: true } } } },
      star: {
        include: { attributes: { include: { attribute: { select: { id: true, name: true } } } } }
      }
    }
  })

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  const attributes = await prisma.attribute.findMany({ select: { id: true, name: true }, where: { starOnly: false } })

  // check if title matches api
  const isValid = {
    title: true,
    fname: video.slug !== null && video.slug === dirOnly(video.path) // fname is invalid if slug=null, or slug!=path
  }
  if (!video.validated && video.slug !== null) {
    try {
      const apiResponse = await getVideo(video.slug)

      const countChars = (str: string, char: string) =>
        (str.match(new RegExp(`${escapeRegExp(char)}`, 'g')) ?? []).length

      const specialChars = ['%', '*', '?', ':'] // "%" can be removed, when finished processing all files, as it not an illegal character

      // check validity of title
      isValid.title = !specialChars.some(char => {
        const countApiTitle = countChars(apiResponse.name, char)
        const countVideoTitle = countChars(video.name, char)

        return countApiTitle !== countVideoTitle
      })

      // Update if title is valid
      if (isValid.title) {
        await prisma.video.update({
          where: { id },
          data: { validated: true }
        })
      }
    } catch (e) {
      //
    }
  }

  return (
    <Client
      isValid={isValid}
      categories={categories}
      attributes={attributes}
      outfits={outfits}
      stars={stars.map(({ attributes, ...star }) => ({
        ...star,
        attributes: attributes.map(({ attribute }) => attribute)
      }))}
      bookmarks={bookmarks.map(({ category, star, ...bookmark }) => {
        const starAttributes = star?.attributes.map(({ attribute }) => attribute) ?? []
        const bookmarkAttributes = bookmark.attributes.map(({ attribute }) => attribute)

        return {
          ...bookmark,
          name: category.name,
          outfit: bookmark.outfit?.name ?? null,
          attributes: getUnique([...starAttributes, ...bookmarkAttributes], 'id'),
          starID: star?.id ?? 0,
          starImage: star?.image ?? undefined,
          active: false
        }
      })}
      video={{
        id: video.id,
        slug: video.slug,
        name: video.name,
        episode: video.episode,
        path: {
          file: video.path,
          stream: `${noExt(video.path)}/master.m3u8`
        },
        franchise: video.franchise,
        noStar: video.noStar,
        duration: video.duration,
        date: {
          added: formatDate(video.date),
          published: video.date_published ? formatDate(video.date_published) : null
        },
        brand: video.brand,
        quality: video.height,
        censored: video.cen,
        related: (
          await prisma.video.findMany({
            where: { franchise: video.franchise },
            orderBy: { episode: 'asc' },
            select: {
              id: true,
              name: true,
              cover: true,
              _count: { select: { plays: true } }
            }
          })
        ).map(({ cover, _count, ...video }) => ({
          ...video,
          image: cover,
          plays: _count.plays
        }))
      }}
    />
  )
}
