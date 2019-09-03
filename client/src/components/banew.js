import faker from 'faker'
import randomcolor from 'randomcolor'

import React, { Component } from 'react'
import { render } from 'react-dom'

import deepstream from '@deepstream/client'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from 'y-quill'

import Quill from 'quill'
import 'quill/dist/quill.snow.css'

import QuillCursors from 'quill-cursors'
Quill.register('modules/cursors', QuillCursors)

class Root extends Component {
  username = faker.name.findName()
  color = randomcolor()

  componentDidMount() {
    // this.initDeepstream()
    this.initEditor()
  }

  render() {
    return (
      <div>
        <div ref='editor'></div>
      </div>
    )
  }

  initDeepstream = () => {
    this.client = deepstream('localhost:6020')
    this.client.login({ username: this.username })
    this.client.event.subscribe('test', payload => {
      for (const username in payload) {
        if (username === this.username) continue

        // if (payload[username].type === 'mousemove') {
        //   if (this.dom[username]) {
        //     this.dom[username].style.top = payload[username].screenY - 10 + 'px'
        //     this.dom[username].style.left = payload[username].screenX - 10 + 'px'
        //   } else {
        //     this.dom[username] = document.createElement('div')
        //     // this.dom[username].innerHTML = username
        //     this.dom[username].style.position = 'absolute'
        //     this.dom[username].style.top = payload[username].screenY - 10 + 'px'
        //     this.dom[username].style.left = payload[username].screenX - 10 + 'px'
        //     this.dom[username].style.width = 20 + 'px'
        //     this.dom[username].style.height = 20 + 'px'
        //     this.dom[username].style.borderRadius = '50%'
        //     this.dom[username].style.backgroundColor = this.color
        //     this.dom[username].style.opacity = .7
        //     this.refs.container.appendChild(this.dom[username])
        //   }
        // }

        if (payload[username].type === 'selection-change') {
          this.cursor.createCursor(username, username, payload[username].color)
          this.cursor.moveCursor(username, payload[username].range)
        }
      }
    })
  }

  initEditor = () => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('ws://192.168.1.53:8888', 'quill', ydoc)
    const type = ydoc.getText('quill')
    const editor = new Quill(this.refs.editor, {
      theme: 'snow',
      modules: {
        cursors: true,
      },
    })

    const binding = new QuillBinding(type, editor, provider.awareness)

//     this.cursor = editor.getModule('cursors')
//
//     this.cursor.createCursor(this.username, this.username, this.color)
//
//     editor.on('selection-change', range => {
//       const type = 'selection-change'
//       const color = this.color
//       const payload = { [this.username]: { type, range, color } }
//       this.client.event.emit('test', payload)
//     })

    provider.awareness.setLocalStateField('user', {
      name: this.username,
      color: this.color,
    })
  }
}

render(<Root />, document.getElementById('root'))
//
