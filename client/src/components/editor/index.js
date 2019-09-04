import Editor from './editor'

export default class Index extends Component {
  render() {
    return (
      <>
        <div className='flex-1x'></div>
        <div className='flex-3x'>
          <Editor />
        </div>
        <div className='flex-1x'></div>
      </>
    )
  }
}
