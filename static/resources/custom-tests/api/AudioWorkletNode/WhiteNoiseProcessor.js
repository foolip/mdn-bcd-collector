//
// mdn-bcd-collector: static/resources/custom-tests/api/AudioWorkletNode/WhiteNoiseProcessor.js
// Custom test worklet for api.AudioWorkletNode, example copied from:
// https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode
//
// © Mozilla Corporation, Gooborg Studios
// See the LICENSE file for copyright details
//

/* global AudioWorkletProcessor, registerProcessor */

class WhiteNoiseProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.random() * 2 - 1;
      }
    });
    return true;
  }
}

registerProcessor('white-noise-processor', WhiteNoiseProcessor);
