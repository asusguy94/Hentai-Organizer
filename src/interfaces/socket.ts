import type { NextApiResponse } from 'next/types'
import type { Server as HttpServer } from 'http'
import type { Socket as NetSocket } from 'net'
import type { Server } from 'socket.io'
import type { Socket } from 'socket.io-client'

type ServerToClientEvents = {
  vtt: (data: string) => void
  meta: (data: string) => void
  createdMessage: (data: string) => void
}

type ClientToServerEvents = {
  createdMessage: (data: string) => void
}

type SocketServer = HttpServer & {
  io?: Server<ServerToClientEvents, ClientToServerEvents>
}

type SocketWithIO = NetSocket & {
  server: SocketServer
}

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: SocketWithIO
}

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>
