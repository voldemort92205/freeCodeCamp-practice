import React from 'react';
import Badge from "react-bootstrap/Badge";
import {marked} from 'marked'

marked.use ({
  mangle: false,
  headerIds: false,
})

export default class App extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      markdownText: "# header",
    }
    this.updatePreview = this.updatePreview.bind(this);
  }
  updatePreview(event){
    this.setState({
      markdownText: event.target.value
    });
  }
  render(){
    var inputSyle = {
      width: "400px",
      height: "50vh",
      marginLeft: "auto",
      marginRight: "auto",
      padding: "10px",
    };
    var previewStyle = {
      width: "500px",
      height: "80vh",
      backgroundColor: "#DCDCDC",
      marginLeft: "auto",
      marginRight: "auto",
      padding: "10px",
      overflow: "visible scroll",
    };
    return (
      <div className="App">
        <div className="container">
          <div className='row mt-4'>
            <div className='col text-center'>
              <h1>
                <Badge className="text-align-center" variant="light">
                  Markdown Previewer
                </Badge>
              </h1>
            </div>
            <div className='row mt-4'>
              <div className='col-md-6'>
                <div className='col text-center'>
                  <h2>
                    <Badge className='text-align-center' variant="secondary">
                      Input Markdown</Badge>
                  </h2>
                </div>
                <div className='mark-input text-center'>
                    <textarea className='input' style={inputSyle}
                        value={this.state.markdownText}
                        onChange={this.updatePreview}></textarea>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='col text-center'>
                  <h2>
                    <Badge className='text-align-center' variant="secondary">Preview</Badge>
                  </h2>
                </div>
                <div style={previewStyle}
                    dangerouslySetInnerHTML={{
                      __html: marked(this.state.markdownText),
                    }}>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );}
}

