import Header from './header'
import Main from './main'

class Layout extends Component {
  render() {
    return (
      <div className='flex-column flex-1x' id='layout'>
        <Header />
        <Main>
          {this.props.children}
        </Main>
      </div>
    )
  }
}

export default Children => {
  return function Wrapper() {
    return (
      <Layout>
        <Children />
      </Layout>
    )
  }
}
