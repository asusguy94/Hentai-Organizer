import { Params } from '@interfaces'
import { noExt, sendFile } from '@utils/server/helper'
import { db } from '@utils/server/prisma'

export async function GET(req: Request, { params }: Params<['id', 'stream', 'streamId']>) {
  const id = parseInt(params.id)
  const { stream, streamId } = params

  if (/^stream\d+$/.test(stream) && /^\d{4}\.ts$/.test(streamId)) {
    const video = await db.video.findFirstOrThrow({ where: { id } })

    return await sendFile(`./media/videos/${noExt(video.path)}/${stream}/${streamId}`)
  }
}
