import React, { Component } from 'react';
import loadImage from 'blueimp-load-image';
import { InferenceSession } from 'onnxjs';

import * as runModelUtils from './utils/runModel';
import * as imageProcessingUtils from './utils/imageProcessing';
import { getPredictedClass } from './utils';

import { SQUEEZENET_IMAGE_URLS as data } from './data/sample-image-url';

// import logo from './logo.svg';
import './App.css';

const INITIAL_STATE = {
    sessionRunning: false,
    inferenceTime: 0,
    imageURLInput: '',
    imageURLSelect: null,
    imageLoading: false,
    imageLoadingError: false,
    output: [],
    image: {
      size: 0,
    },
    modelLoading: false,
    modelLoaded: false,
    backendHint: 'webgl',
}

class App extends Component {
  state = { ...INITIAL_STATE };
  // session = InferenceSession();
  imageSize = 224;
  session = new InferenceSession({backendHint: this.state.backendHint});

  init() {
    this.setState(INITIAL_STATE);
    const element = document.getElementById('input-canvas') as HTMLCanvasElement;
    if (element) {
      const ctx = element.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    }
  }


  runModel = async () => {
    try {
      const element = document.getElementById('input-canvas') as HTMLCanvasElement;
      const ctx = element.getContext('2d') as CanvasRenderingContext2D; 
      const preProcessedData = imageProcessingUtils.preProcess(ctx);
      if (!this.state.modelLoaded) {
        this.setState({
          modelLoading: true,
        });
        await this.session.loadModel('./squeezenet1_1.onnx');
        this.setState({
          modelLoaded: true,
          modelLoading: false,
        });
      }
      let [tensorOutput, inferenceTime] = await runModelUtils.runModel(this.session, preProcessedData);
      if (!!tensorOutput) {
        this.setState({
          output: tensorOutput.data,
          sessionRunning: false,
          inferenceTime,
        }, () => {
          console.log(getPredictedClass(tensorOutput.data as Float32Array), inferenceTime)
        });
      }
    }
    catch(e) {
      console.warn(e);
    }
  }

  loadImageToCanvas(url: string) {
    if (!url) {
        this.init();
        return;
    }
    this.setState({
      imageLoading: true,
    });

    loadImage(
        url,
        (img: Event | HTMLImageElement) => {
        if ((img as Event).type === 'error') {
            this.setState({
              imageLoading: false,
              imageLoadingError: true,
            });
        } else {
          const element = document.getElementById('input-canvas') as HTMLCanvasElement;
          if (element) {
            const ctx = element.getContext('2d');
            if (ctx) {
              ctx.drawImage(img as HTMLImageElement, 0, 0);
              this.setState({
                imageLoadingError: false,
                imageLoading: false,
                sessionRunning: true,
                output: [],
                inferenceTime: 0,
              }, () => {
                this.runModel();
              });
            }
          }
        }},
        {
          maxWidth: this.imageSize,
          maxHeight: this.imageSize,
          cover: true,
          crop: true,
          canvas: true,
          crossOrigin: 'Anonymous',
        }
    );
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
            {/* <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p> */}
          <select onChange={(e) => this.loadImageToCanvas(e.target.value)}>
            {data.map((item) => (
              <option key={item.value} value={item.value}>{item.text}</option>
            ))}
          </select>
          <canvas id="input-canvas" width={this.imageSize} height={this.imageSize} />
        </header>
      </div>
    );
  }
}

export default App;
