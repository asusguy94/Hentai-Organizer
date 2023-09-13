import { Params } from '@interfaces'
import { noExt, sendFile } from '@utils/server/helper'
import { db } from '@utils/server/prisma'

//NEXT /video/[id]
export async function GET(req: Request, { params }: Params<['id', 'stream']>) {
  const id = parseInt(params.id)
  const { stream } = params

  if (/^stream\d+$/.test(stream)) {
    const video = await db.video.findFirstOrThrow({ where: { id } })

    return await sendFile(`./media/videos/${noExt(video.path)}/${stream}/playlist.m3u8`)
  }
}
