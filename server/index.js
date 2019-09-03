const WebSocket = require('ws')
const http = require('http')
const StaticServer = require('node-static').Server
const setupWSConnection = require('y-websocket/bin/utils.js').setupWSConnection

const { Deepstream } = require('@deepstream/server')

const production = process.env.PRODUCTION != null
const port = process.env.PORT || 8888

const staticServer = new StaticServer('./dist', { cache: production ? 3600 : false, gzip: production })

const server = http.createServer((request, response) => {
  request.addListener('end', () => {
    staticServer.serve(request, response)
  }).resume()
})

const wss = new WebSocket.Server({ server })

wss.on('connection', setupWSConnection)

server.listen(port)

console.log(`Listening to http://localhost:${port} ${production ? '(production)' : ''}`)

const deepstreamServer = new Deepstream({})
deepstreamServer.start()
