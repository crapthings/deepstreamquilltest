const WebSocket = require('ws')
const fs = require('fs')
// const http = require('http')
const https = require('https')
// const StaticServer = require('node-static').Server
const setupWSConnection = require('y-websocket/bin/utils.js').setupWSConnection

const { Deepstream } = require('@deepstream/server')

const production = process.env.PRODUCTION != null
const port = process.env.PORT || 8888

// const staticServer = new StaticServer('./dist', { cache: production ? 3600 : false, gzip: production })
//
// const server = https.createServer((request, response) => {
//   request.addListener('end', () => {
//     staticServer.serve(request, response)
//   }).resume()
// })

const server = https.createServer({
  cert: fs.readFileSync('../server.cert', 'utf8'),
  key: fs.readFileSync('../server.key', 'utf8')
})

const wss = new WebSocket.Server({ server })

wss.on('connection', setupWSConnection)

server.listen(port)

console.log(`Listening to http://localhost:${port} ${production ? '(production)' : ''}`)

const deepstreamServer = new Deepstream({
  // 'sslCert': fs.readFileSync('../server.cert'),
  // 'sslKey': fs.readFileSync('../server.key'),
})
// deepstreamServer.set('sslCert', fs.readFileSync('../server.cert', 'utf8'))
// deepstreamServer.set('sslKey', fs.readFileSync('../server.key', 'utf8'))
deepstreamServer.start()
