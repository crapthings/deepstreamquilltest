import '@babel/polyfill'

import faker from 'faker'
import randomcolor from 'randomcolor'

import _ from 'lodash'
import nanoid from 'nanoid'
import deepstream from '@deepstream/client'
import { render } from 'react-dom'

const client = deepstream('localhost:6020')

class LoginScreen extends Component {
  onSubmit = evt => {
    evt.preventDefault()
    const username = evt.target[0].value
    this.props.login({ username })
  }

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <div>
          <input type='text' />
        </div>
        <div>
          <input type='submit' />
        </div>
      </form>
    )
  }
}

class UsersScreen extends Component {
  state = {
    users: {}
  }

  async componentDidMount() {
    let _users = await client.presence.getAll()
    _users = _.chain(_users).keyBy().mapValues(_.stubTrue).value()
    this.setState({ users: _users }, () => {
      client.presence.subscribe((username, login) => {
        if (login) {
          const users = Object.assign(this.state.users, { [username]: true })
          this.setState({ users })
        } else {
          const users = Object.assign(this.state.users, { [username]: false })
          this.setState({ users })
        }
      })
    })
  }

  render() {
    return (
      <div>
        {_.map(this.state.users, (isOnline, username) => <div key={username}>{username} <span>{isOnline ? 'online' : 'offline'}</span></div>)}
      </div>
    )
  }
}

class Root extends Component {
  state = {
    loading: false,
    currentUser: null,
  }

  login = user => {
    this.setState({ loading: true }, () => {
      client.login(user, () => {
        this.setState({ loading: false, currentUser: user })
      })
    })
  }

  componentDidMount() {
  }

  render() {
    const { loading, currentUser } = this.state

    if (loading) {
      return (
        <div>loading</div>
      )
    }

    if (!currentUser) {
      return (
        <LoginScreen login={this.login} />
      )
    }

    return (
      <div>
        <UsersScreen />
      </div>
    )
  }
}

render(<Root />, document.getElementById('root'))
