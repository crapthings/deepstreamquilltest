export default class Aside extends Component {
  render() {
    return (
      <div className='flex-column' id='aside' style={{ width: '160px' }}>
        <div>
          <Link to='/'>home</Link>
        </div>

        <div>
          <Link to='/documents/test/editor'>test editor</Link>
        </div>
      </div>
    )
  }
}
