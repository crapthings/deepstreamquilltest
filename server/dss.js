// const QuillDeltaToHtmlConverter = require('quill-delta-to-html').QuillDeltaToHtmlConverter
const { Deepstream } = require('@deepstream/server')
const deepstream = require('@deepstream/client')

// const MongoDBStorageConnector = require('./deepstream.io-storage-mongodb')

const server = new Deepstream({})

// let db = '<p>initial text</p>'

// server.set('storage', new MongoDBStorageConnector({
//   connectionString: 'mongodb://localhost:27017/ot',
//   connectionOptions: {
//     useNewUrlParser: true,
//   },
//   splitChar: '/'
// }))

server.start()

// const client = deepstream('localhost:6020')
// client.login({ username: 'server' })
//
// client.event.subscribe('test', payload => {
//   for (const username in payload) {
//     const p = payload[username]
//     if (p.type === 'text-change') {
//       const test = p.oldContents.ops.concat(p.delta.ops)
//       const converter = new QuillDeltaToHtmlConverter(test)
//       db = converter.convert()
//     }
//   }
//   // jsonlog(payload)
// })
//
// function jsonlog(log) {
//   console.log(JSON.stringify(log, null, 2))
// }
