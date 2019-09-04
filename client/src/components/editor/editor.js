import faker from 'faker'
import randomcolor from 'randomcolor'

import React, { Component } from 'react'
import { render } from 'react-dom'

import deepstream from '@deepstream/client'
import Peer from 'simple-peer'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from '../../../y-quill'

import Quill from 'quill'
import 'quill/dist/quill.snow.css'

import QuillCursors from 'quill-cursors'

Quill.register('modules/cursors', QuillCursors)

const VIDEO_CONFIG = { video: {
  width: 320,
  height: 240,
  frameRate: {
    ideal: 20,
    min: 10
  }
}, audio: true }

const SERVER_CONFIG = { config: { iceServers: [{ urls: 'stun:stun.xten.com' }] } }

export default class Editor extends Component {
  username = faker.name.findName()
  color = randomcolor()

  componentDidMount() {
    this.initDeepstream()
    this.initEditor()
  }

  componentWillUnmount() {
    this.client.close()
  }

  render() {
    return (
      <>
        <div ref='users'>
          <video src=""></video>
        </div>
        <div ref='container' className='fit-parent' style={{ position: 'relative' }} onMouseMove={this.onMouseMove}>
          <div ref='editor'></div>
        </div>
      </>
    )
  }

  initDeepstream = () => {
    this.client = deepstream('wss://10.0.0.101:8666')
    this.client.login({ username: this.username }, () => {
      this.checkPresence()
      this.initVideo()
    })
    this.client.event.subscribe('test', payload => {
      for (const username in payload) {
        if (username === this.username) continue
        if (payload[username].type === 'selection-change') {
          this.cursor.createCursor(username, username, payload[username].color)
          this.cursor.moveCursor(username, payload[username].range)
        }
      }
    })
  }

  initEditor = () => {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('wss://10.0.0.101:8888', 'quill', ydoc)
    const type = ydoc.getText('quill')
    const editor = new Quill(this.refs.editor, {
      theme: 'snow',
      modules: {
        cursors: true,
      },
    })
    const binding = new QuillBinding(type, editor, provider.awareness)
    this.cursor = editor.getModule('cursors')
    this.cursor.createCursor(this.username, this.username, this.color)
    editor.on('selection-change', range => {
      const type = 'selection-change'
      const color = this.color
      const payload = { [this.username]: { type, range, color } }
      this.client.event.emit('test', payload)
    })
  }

  onMouseMove = evt => {
    const type = 'mousemove'
    const { pageX: screenX, pageY: screenY } = evt
    const payload = { [this.username]: { screenX, screenY, type } }
    this.client.event.emit('test', payload)
  }

  checkPresence = async () => {
    this.client.presence.subscribe(async (username, isLoggedIn) => {
      if (isLoggedIn) {
      } else {
      }
    })
  }

  initVideo = async () => {
    const users = [this.username, ...await this.client.presence.getAll()]
    const peers = {}
    console.log(users)

    this.client.event.subscribe('signal', payload => {
      console.log(payload)
      // for (const p in peers) {
      //   if (p === this.username) continue
      //   console.log(p, peers[p])
      //   peers[p].signal(payload.data)
      // }
    })

    for (const user of users) {
      if (user === this.username) {
        const myPeer = new Peer({ ...SERVER_CONFIG })
        peers[user] = myPeer
        myPeer.on('signal', data => {
          this.client.event.emit('signal', { user, data })
        })

        myPeer.on('stream', stream => {
          console.log(stream)
    // got remote video stream, now let's show it in a video tag
          var video = document.querySelector('video')

          if ('srcObject' in video) {
            video.srcObject = stream
          } else {
            video.src = window.URL.createObjectURL(stream) // for older browsers
          }

          video.play()
        })
      } else {
        const userStream = await navigator.mediaDevices.getUserMedia(VIDEO_CONFIG)
        const userPeer = new Peer({ initiator: true, stream: userStream, ...SERVER_CONFIG })
        peers[user] = userPeer
        userPeer.on('signal', data => {
          this.client.event.emit('signal', { user, data })
        })
      }
    }
  }
}
