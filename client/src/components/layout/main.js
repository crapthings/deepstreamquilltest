import Aside from './aside'
import Content from './content'

export default class Main extends Component {
  render() {
    return (
      <div className='flex-row flex-1x' id='main'>
        <Aside />
        <Content>
          {this.props.children}
        </Content>
      </div>
    )
  }
}
