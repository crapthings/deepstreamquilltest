import deepstream from '@deepstream/client'
import SimplePeer from 'simple-peer'

export default class FlexRTC {
  constructor(options) {
    this.options = options
    this.init()
  }

  init = async () => {
    this.connections = {}
    this.connection = deepstream(this.options.url)
    await this.connection.login()
    this.currentPeer = this.connection.getUid()
    window.peers = this.peers = this.connection.record.getList('peers')
    await this.peers.whenReady()
    this.peers.addEntry(this.currentPeer)
    this.SubscribeRecord()
    this.SubscribeEvent()
  }

  SubscribeEvent = () => this.connection.event.subscribe(`rtc-signal/${this.currentPeer}`, this.onSignal)

  onSignal = ({ peer, signal }) => {
    console.log(peer, signal)
    this.connections[peer] && this.connections[peer].processSignal(signal)
  }

  SubscribeRecord = () => this.peers.subscribe(this.onPeers)

  onPeers = _peers => {
    const { options, connections, connection, currentPeer, peers } = this

    _peers.forEach(peer => {
      if (this.connections[peer]) return
      if (this.currentPeer === peer) return
      this.connections[peer] = new Peer({ options, connections, connection, currentPeer, peers, peer })
    })

    for (let peer in connections) {
      if (_peers.indexOf(peer) === -1) connections[peer].destroy()
    }
  }
}

class Peer {
  constructor({ options, connections, connection, currentPeer, peers, peer }) {
    this.options = options
    this.connections = connections
    this.connection = connection
    this.currentPeer = currentPeer
    this.peers = peers
    this.peer = peer

    this._isConnected = false

    this.videoWrapper = document.getElementById('video-wrapper')
    this.video = document.createElement('video')
    this.video.id = peer
    this.video.width = 320
    this.video.height = 240
    this.videoWrapper.appendChild(this.video)

    if (this.videoWrapper)
      navigator.getUserMedia({ video: true, audio: true }, this.getUserMedia, () => {})

    if (!this.videoWrapper)
      this.connect()
  }

  connect = ({ stream }) => {
    const { options: { iceServers }, currentPeer, peer } = this

    const options = {
      config: { iceServers },
      initiator: currentPeer > peer,
      trickle: false,
    }

    if (stream)
      options.stream = stream

    this._p2pConnection = new SimplePeer(options)
    this._p2pConnection.on('error', this.onError)
    this._p2pConnection.on('connect', this.onConnect)
    this._p2pConnection.on('signal', this.onSignal)
    this._p2pConnection.on('data', this.onData)
    this._p2pConnection.on('stream', this.onStream)
    this._p2pConnection.on('close', this.onClose)
    setTimeout(this._checkConnected, 50000)
  }

  getUserMedia = stream => this.connect({ stream })

  processSignal = signal => {
    console.log(signal)
    this._p2pConnection.signal(signal)
  }

  send = msg => this._p2pConnection.send(msg)

  destroy = () => this._p2pConnection.destroy()

  onError = error => console.log('on error', error)

  onConnect = () => {
    this._isConnected = true
    console.log('on connect' + this.peer)
  }

  onSignal = signal => {
    this.connection.event.emit(`rtc-signal/${this.peer}`, {
      peer: this.currentPeer,
      signal,
    })
  }

  onData = data => console.log('on data', data)

  onStream = stream => {
    this.video.srcObject = stream
    this.video.play()
  }

  onClose = () => {
    console.log('on close', this.peer)
    delete this.connections[this.peer]
    this.peers.removeEntry(this.peer)
    this.videoWrapper.removeChild(this.video)

    if (this._p2pConnection) {
      if (this._p2pConnection.stream) {
        this._p2pConnection.stream.getTracks().forEach(track => track.stop())
      }
    }
  }

  _checkConnected = () => {
    if (!this._isConnected) {
      this.destroy()
    }
  }
}
