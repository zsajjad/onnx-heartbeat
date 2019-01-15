import React, { Component } from 'react';
import loadImage from 'blueimp-load-image';
import { InferenceSession } from 'onnxjs';

import * as runModelUtils from './utils/runModel';
import * as imageProcessingUtils from './utils/imageProcessing';
import { getPredictedClass } from './utils';

import { SQUEEZENET_IMAGE_URLS } from './data/sample-image-url';
import * as Styled from './Styled';
import Loader from './components/Loader';

interface OutputItem {
  id: string;
  probability: number;
  name: string;
}

const INITIAL_STATE = {
    sessionRunning: false,
    inferenceTime: 0,
    error: false,
    output: [],
    modelLoading: false,
    modelLoaded: false,
    backendHint: 'webgl', // ['webgl', 'wasm', 'cpu']
    selectedImage: null,
}

class App extends Component {
  state = { ...INITIAL_STATE };
  // session = InferenceSession();
  imageSize = 224;
  session = new InferenceSession({ backendHint: this.state.backendHint });

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
          output: getPredictedClass(tensorOutput.data as Float32Array),
          sessionRunning: false,
          inferenceTime,
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
      sessionRunning: true,
      output: [],
      selectedImage: url,
    });

    loadImage(
        url,
        (img: Event | HTMLImageElement) => {
        if ((img as Event).type === 'error') {
            this.setState({
              sessionRunning: false,
              error: 'Unable to load image in canvas',
              output: [],
              inferenceTime: 0,
            });
        } else {
          const element = document.getElementById('input-canvas') as HTMLCanvasElement;
          if (element) {
            const ctx = element.getContext('2d');
            if (ctx) {
              ctx.drawImage(img as HTMLImageElement, 0, 0);
              this.setState({
                error: 'Something went wrong during detection',
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
      <React.Fragment>
        <canvas id="input-canvas" width={this.imageSize} height={this.imageSize} />
        <Styled.Heading>ONNX - Heartbeat</Styled.Heading>
        <Styled.ImagesRow>
          {SQUEEZENET_IMAGE_URLS.map((item) => (
            <Styled.ImageContainer data-selected={this.state.selectedImage === item.value} data-background={item.value} key={item.value} onClick={() => this.loadImageToCanvas(item.value)} />
          ))}
        </Styled.ImagesRow>
        <Styled.Description>{this.state.modelLoading && 'Loading Model, this make take a bit longer please hold'} {this.state.sessionRunning && 'Processing Image'}</Styled.Description>
        <Styled.ResultContainer>
          {this.state.output ? 
          this.state.output.map((item: OutputItem) => {
            return (<Styled.ResultItem key={item.id}>
              <p>{item.name}</p>
              <span>{(item.probability * 100).toFixed(2)}%</span>
            </Styled.ResultItem>);
          }) : null}
          {this.state.sessionRunning && <Loader />}
        </Styled.ResultContainer>
      </React.Fragment>
    );
  }
}

export default App;
