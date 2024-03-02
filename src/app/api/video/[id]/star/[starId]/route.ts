import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function DELETE(req: Request, { params }: Params<['id', 'starId']>) {
  const { id, starId } = validate(
    z.object({
      id: z.coerce.number(),
      starId: z.coerce.number()
    }),
    params
  )

  return Response.json(
    await db.videoStars.delete({
      where: { starID_videoID: { videoID: id, starID: starId } }
    })
  )
}
