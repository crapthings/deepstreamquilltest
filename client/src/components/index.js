import faker from 'faker'
import randomcolor from 'randomcolor'

import React, { Component } from 'react'
import { render } from 'react-dom'

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
    this.initEditor()
  }

  render() {
    return (
      <div>
        <div ref='editor'></div>
      </div>
    )
  }

  initEditor = () => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('ws://localhost:8888', 'quill', ydoc)
    const type = ydoc.getText('quill')
    const editor = new Quill(this.refs.editor, {
      theme: 'snow',
      modules: {
        cursors: true,
      },
    })

    const binding = new QuillBinding(type, editor, provider.awareness)

    provider.awareness.setLocalStateField('user', {
      name: this.username,
      color: this.color,
    })
  }
}

render(<Root />, document.getElementById('root'))
