export default class Main extends Component {
  render() {
    return (
      <div className='flex-row flex-1x' id='content'>
        {this.props.children}
      </div>
    )
  }
}
