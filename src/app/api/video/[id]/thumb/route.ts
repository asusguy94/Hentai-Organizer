import { Params } from '@interfaces'
import { sendFile } from '@utils/server/helper'

//NEXT /(home) && /star/[id] && /video/id && /video/search
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return await sendFile(`./media/images/videos/${id}.png`)
}
