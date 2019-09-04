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

export default class Editor extends Component {
  username = faker.name.findName()
  color = randomcolor()
  dom = {}

  componentDidMount() {
    this.initDeepstream()
    this.initEditor()

    // this.initVideo()
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
    })
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

  initVideo = () => {
    navigator.getUserMedia({ video: {
      width: 320,
      height: 240,
      frameRate: {
        ideal: 20,
        min: 10
      }
    }, audio: true }, gotMedia, () => {})

    function gotMedia (stream) {
      var peer1 = new Peer({ initiator: true, stream: stream })
      var peer2 = new Peer()

      peer1.on('signal', data => {
        peer2.signal(data)
      })

      peer2.on('signal', data => {
        peer1.signal(data)
      })

      peer2.on('stream', stream => {
        // got remote video stream, now let's show it in a video tag
        var video = document.querySelector('video')

        if ('srcObject' in video) {
          video.srcObject = stream
        } else {
          video.src = window.URL.createObjectURL(stream) // for older browsers
        }

        video.play()
      })
    }
  }

  onMouseMove = evt => {
    const type = 'mousemove'
    const { pageX: screenX, pageY: screenY } = evt
    const payload = { [this.username]: { screenX, screenY, type } }
    this.client.event.emit('test', payload)
  }

  checkPresence = async () => {
    // const users = {}
    // const server = { config: { iceServers: [{ urls: 'stun:stun.xten.com' }] } }
    // this.stream = await navigator.mediaDevices.getUserMedia({ video: {
    //   width: 320,
    //   height: 240,
    //   frameRate: {
    //     ideal: 20,
    //     min: 10
    //   }
    // }, audio: true })
    // const peer = new Peer({ initiator: true, stream: this.stream, ...server })

    // peer.on('signal', data => {
    //   this.client.event.emit('signal', { username: this.username, data })
    // })

    // this.client.event.subscribe('signal', payload => {
    //   if (payload.username === this.username) return
    //   // console.log(payload)
    //   // console.log('asd', users)
    // })

    this.client.presence.subscribe(async (username, isLoggedIn) => {
      console.log(username)
      if (isLoggedIn) {
        const users = await this.client.presence.getAll()

        console.log(users)

//         const user = new Peer({ ...server })
//
//
//
//         user.on('signal', data => {
//           users[username] = user
//           console.log(users)
//           this.client.event.emit('signal', { username: username, data })
//         })
//
//         user.on('stream', stream => {
//           // got remote video stream, now let's show it in a video tag
//           var video = document.querySelector('video')
//
//           if ('srcObject' in video) {
//             video.srcObject = stream
//           } else {
//             video.src = window.URL.createObjectURL(stream) // for older browsers
//           }
//
//           video.play()
//         })
      } else {
        // this.refs.container.removeChild(this.dom[username])
      }
    })
  }
}
