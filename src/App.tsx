import React, { Component } from 'react';
import loadImage from 'blueimp-load-image';
import { InferenceSession } from 'onnxjs';

import { runModelUtils } from './utils';
import { preProcess } from './utils/models/squeezenet';
import { SQUEEZENET_IMAGE_URLS as data } from './data/sample-image-url';

import logo from './logo.svg';
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
}

class App extends Component {
  state = { ...INITIAL_STATE };
  // session = InferenceSession();
  session = new InferenceSession();

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
      const preProcessedData = preProcess(ctx);
      this.setState({
        modelLoading: true,
      });
      console.log(preProcessedData);
      await this.session.loadModel('./models/squeezenet1_1.onnx');
      let [tensorOutput, inferenceTime] = await runModelUtils.runModel(this.session, preProcessedData);
      if (!!tensorOutput) {
        this.setState({
          output: tensorOutput.data,
          sessionRunning: false,
          inferenceTime,
        });
      }
    }
    catch(e) {
      console.log(e);
    }
  }

  preProcess(ctx: CanvasRenderingContext2D): any {
    throw new Error("Method not implemented.");
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
            // load image data onto input canvas
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
          maxWidth: 300,
          maxHeight: 150,
          cover: false,
          crop: false,
          canvas: true,
          crossOrigin: 'Anonymous',
        }
    );
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <select onChange={(e) => this.loadImageToCanvas(e.target.value)}>
            {data.map((item) => (
              <option key={item.value} value={item.value}>{item.text}</option>
            ))}
          </select>
          <canvas id="input-canvas" />
        </header>
      </div>
    );
  }
}

export default App;
