// const QuillDeltaToHtmlConverter = require('quill-delta-to-html').QuillDeltaToHtmlConverter
const { Deepstream } = require('@deepstream/server')
const deepstream = require('@deepstream/client')

const server = new Deepstream()

// let db = '<p>initial text</p>'

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
