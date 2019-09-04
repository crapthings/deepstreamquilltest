import '@babel/polyfill'

import faker from 'faker'
import randomcolor from 'randomcolor'

import _ from 'lodash'
import nanoid from 'nanoid'
import deepstream from '@deepstream/client'
import { render } from 'react-dom'

// import automerge from 'automerge'

import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import QuillCursors from 'quill-cursors'
Quill.register('modules/cursors', QuillCursors)

class Root extends Component {
  state = {
    loading: true,
    text: undefined,
  }

  client = deepstream('localhost:6020')
  username = nanoid()
  color = randomcolor()
  dom = {}

  onConnected = () => {
    this.client.on('connectionStateChanged', console.log)
  }

  login = cb => {
    this.client.login({ username: this.username }, async (success) => {
      if (!success) return
      const test = await this.client.presence.getAll()
      console.log(test)
      this.text = this.client.record.getRecord('test/randomid')
      const { record } = await this.text.whenReady()
      this.setState({ loading: false }, () => {
        cb && cb()

      })
    })
  }

  subscribe = () => {
    this.client.event.subscribe('test', payload => {
      for (const username in payload) {
        if (username === this.username) continue

        if (payload[username].type === 'mousemove') {
          if (this.dom[username]) {
            this.dom[username].style.top = payload[username].screenY - 10 + 'px'
            this.dom[username].style.left = payload[username].screenX - 10 + 'px'
          } else {
            this.dom[username] = document.createElement('div')
            // this.dom[username].innerHTML = username
            this.dom[username].style.position = 'absolute'
            this.dom[username].style.top = payload[username].screenY - 10 + 'px'
            this.dom[username].style.left = payload[username].screenX - 10 + 'px'
            this.dom[username].style.width = 20 + 'px'
            this.dom[username].style.height = 20 + 'px'
            this.dom[username].style.borderRadius = '50%'
            this.dom[username].style.backgroundColor = this.color
            this.dom[username].style.opacity = .7
            this.refs.container.appendChild(this.dom[username])
          }
        }

        if (payload[username].type === 'selection-change') {
          this.cursor.createCursor(username, username, this.color)
          this.cursor.moveCursor(username, payload[username].range)
        }

        if (payload[username].type === 'text-change') {
          this.quill.updateContents(payload[username].delta)
        }
      }
    })
  }

  initQuill = () => {
    this.refs.editor.innerHTML = this.text.record.data['test/randomid']

    this.quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        cursors: true,
      }
    })

    console.log(this.refs.editor)


    this.cursor = this.quill.getModule('cursors')

    this.cursor.createCursor(this.username, this.username, 'blue')

    this.quill.on('selection-change', range => {
      const type = 'selection-change'
      const payload = { [this.username]: { range, type } }
      this.client.event.emit('test', payload)
    })

    this.quill.on('text-change', (delta, oldContents, source) => {
      const type = 'text-change'
      const payload = { [this.username]: { type, delta, oldContents, source } }
      // console.log(delta, oldContents, source)
      if (source === 'user') {
        this.client.event.emit('test', payload)
      }
      // console.log(1)

      this.text.set('test/randomid', this.quill.root.innerHTML)
    })
  }

  checkPresence = () => {
    this.client.presence.subscribe((username, isLoggedIn) => {
      console.log(username, isLoggedIn)
      if (isLoggedIn) {

      } else {
        this.refs.container.removeChild(this.dom[username])
      }
    })
  }

  componentDidMount() {
    // this.onConnected()
    this.login(() => {
      this.subscribe()
      this.initQuill()
      this.checkPresence()
    })
  }

  onMouseMove = evt => {
    const type = 'mousemove'
    const { pageX: screenX, pageY: screenY } = evt
    const payload = { [this.username]: { screenX, screenY, type } }
    this.client.event.emit('test', payload)
  }

  render() {
    if (this.state.loading) {
      return (
        <div>loading</div>
      )
    }

    return (
      <div ref='container' className='fit-parent' style={{ position: 'relative' }} onMouseMove={this.onMouseMove}>
        <div ref='editor' id='editor'></div>
      </div>
    )
  }
}

render(<Root />, document.getElementById('root'))
