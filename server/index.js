const fs = require('fs')
const https = require('https')

const WebSocket = require('ws')
const { setupWSConnection } = require('y-websocket/bin/utils.js')

const { Deepstream } = require('@deepstream/server')

const PORT = process.env.PORT || 8888

const server = https.createServer({
  cert: fs.readFileSync('../server.cert', 'utf8'),
  key: fs.readFileSync('../server.key', 'utf8')
})

const wss = new WebSocket.Server({ server })

wss.on('connection', setupWSConnection)

server.listen(PORT)

console.log(`Listening to http://localhost:${PORT}`)

const deepstreamServer = new Deepstream({})
deepstreamServer.start()
