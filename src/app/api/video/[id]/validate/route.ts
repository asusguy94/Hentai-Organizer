import { Params } from '@interfaces'
import { getVideo } from '@utils/server/hanime'
import { dirOnly } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { escapeRegExp } from '@utils/shared'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const video = await db.video.findFirstOrThrow({ where: { id } })

  // check if title matches api
  const isValid = {
    title: true,
    fname: video.slug !== null && video.slug === dirOnly(video.path) // fname is invalid if slug=null, or slug!=path
  }
  if (!video.validated && video.slug !== null) {
    try {
      const { name } = await getVideo(video.slug)

      const countChars = (str: string, char: string) => (str.match(new RegExp(escapeRegExp(char), 'g')) ?? []).length

      const specialChars = ['%', '*', '?', ':'] // "%" can be removed, when finished processing all files, as it not an illegal character

      // check validity of title
      isValid.title = !specialChars.some(char => {
        const countApiTitle = countChars(name, char)
        const countVideoTitle = countChars(video.name, char)

        return countApiTitle !== countVideoTitle
      })

      // Update if title is valid
      if (isValid.title) {
        await db.video.update({
          where: { id },
          data: { validated: true }
        })
      }
    } catch (e) {
      //
    }
  }

  return Response.json(isValid)
}
