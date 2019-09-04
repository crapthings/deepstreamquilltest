import { render } from 'react-dom'

import {
  Router,
  Route,
  Switch,
} from 'react-router-dom'

import { createBrowserHistory } from 'history'

import {
  Layout,
  Home,
  Editor,
} from './components'

const route = createBrowserHistory({})

class Routes extends Component {
  render() {
    return (
      <Router history={route}>
        <Switch>
          <Route path='/' component={Home |> Layout} exact />
          <Route path='/documents/:_id/editor' component={Editor |> Layout} exact />
        </Switch>
      </Router>
    )
  }
}

render(<Routes />, document.getElementById('root'))
