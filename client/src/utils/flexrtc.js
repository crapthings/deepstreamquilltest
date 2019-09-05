import deepstream from '@deepstream/client'
import SimplePeer from 'simple-peer'

export default class MeshMedia {
  constructor(options) {
    if (!options.url) throw new Error('deepstream server url required')
    this.options = options
    this.connections = {}
    this.init()
  }

  init = async () => {
    await this.login()
    await this.SubscribePeers()
    this.SubscribeSignal()
  }

  login = async () => {
    this.connection = new deepstream(this.options.url)
    this.currentPeer = this.connection.getUid()
    await this.connection.login({ username: this.currentPeer })
  }

  SubscribePeers = async () => {
    this.peers = this.connection.record.getList('peers')

    this.peers.on('entry-added', () => {
      const peers = this.peers.getEntries()
      console.log('added', peers)
    })

    await this.peers.whenReady()

    this.peers.addEntry(this.currentPeer)
//     this.peers.addEntry('test')
//
//     this.peers.subscribe(this.onPeers, false)
//     // await this.peers.whenReady()
//     this.peers.addEntry(this.currentPeer)
    // this.connection.presence.subscribe(this.onPeerOnline)
  }

  SubscribeSignal = () => {
    this.connection.event.subscribe(`signal/${this.currentPeer}`, this.onSignal, true)
  }

  onPeers = async _peers => {
    const { options, connections, connection, currentPeer, peers } = this

    for (const peer in connections) {
      if (_peers.indexOf(peer) === -1) connections[peer].destroy()
    }

    for (const peer of _peers) {
      // if (connections[peer]) continue
      // if (currentPeer === peer) continue
      connections[peer] = new Peer({ options, connections, connection, currentPeer, peers, peer })
    }
  }

  onSignal = ({ peer, signal }) => {
    if (!this.connections[peer]) return
    this.connections[peer].processSignal(signal)
  }
}

class Peer {
  constructor({ options, connections, connection, currentPeer, peers, peer }) {
    const { quality } = options || { video: true, audio: true }
    this.options = options
    this.connections = connections
    this.connection = connection
    this.currentPeer = currentPeer
    this.peers = peers
    this.peer = peer

    // this._isConnected = false

    this.videoWrapper = document.querySelector('#video-wrapper')
    this.video = document.createElement('video')
    this.video.id = peer
    this.video.width = 320
    this.video.height = 240
    this.videoWrapper.appendChild(this.video)

    if (this.videoWrapper) {
      navigator.getUserMedia(quality, this.getUserMedia, () => {})
    }

    if (!this.videoWrapper) {
      this.connect()
    }
  }

  connect = ({ stream }) => {
    const { options: { iceServers }, currentPeer, peer } = this

    const options = {
      config: { iceServers },
      initiator: currentPeer > peer,
      trickle: true,
    }

    if (stream) {
      options.stream = stream
    }

    this._p2pConnection = new SimplePeer(options)
    this._p2pConnection.on('error', this.onError)
    this._p2pConnection.on('connect', this.onConnect)
    this._p2pConnection.on('signal', this.onSignal)
    this._p2pConnection.on('data', this.onData)
    this._p2pConnection.on('stream', this.onStream)
    this._p2pConnection.on('close', this.onClose)
    setTimeout(this._checkConnected, 5000)
  }

  getUserMedia = stream => {
    this.connect({ stream })
  }

  processSignal = signal => {
    this._p2pConnection.signal(signal)
  }

  send = msg => {
    this._p2pConnection.send(msg)
  }

  destroy = () => {
    this._p2pConnection.destroy()
  }

  onError = error => {
    console.log('on error', error)
  }

  onConnect = () => {
    // this._isConnected = true
    console.log('on connect' + this.peer)
  }

  onSignal = signal => {
    this.connection.event.emit(`signal/${this.peer}`, {
      peer: this.currentPeer,
      signal,
    })
  }

  onData = data => {
    console.log('on data', data)
  }

  onStream = stream => {
    this.video.srcObject = stream
    this.video.play()
  }

  onClose = (...args) => {
    console.log('on close', this.peer)

    if (this._p2pConnection) {
      this._p2pConnection.destroy()
    }

    delete this.connections[this.peer]
    this.peers.removeEntry(this.peer)
    if (this.videoWrapper.contains(this.video)) {
      this.videoWrapper.removeChild(this.video)
    }
  }

  // _checkConnected = () => {
  //   if (!this._isConnected) {
  //     this.destroy()
  //   }
  // }
}
