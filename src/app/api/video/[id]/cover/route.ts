import { Params } from '@interfaces'
import { sendFile } from '@utils/server/helper'

export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return await sendFile(`./media/images/videos/cover/${id}.png`)
}
