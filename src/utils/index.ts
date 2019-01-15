import * as mathUtils from './math';
import * as imagenetUtils from './imagenet';

export function getPredictedClass(res: Float32Array): {} {
  console.log(res);
  if (!res || res.length === 0) {
    const empty = [];
    for (let i = 0; i < 5; i++) {
      empty.push({ 
        name: '-',
        probability: 0,
        index: 0
      });
    }
    return empty;
  }
  const output = mathUtils.softmax(Array.prototype.slice.call(res));
  return imagenetUtils.imagenetClassesTopK(output, 5);
}