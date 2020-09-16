// Custom test worklet for api.AudioWorkletNode, example copied from:
// https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode

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
