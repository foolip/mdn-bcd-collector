// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var instances = {
  AbortController: function() {
    return new AbortController();
  },
  Attr: function() {
    return document.createAttribute('href');
  },
  Document: function() {
      // TODO: might be HTMLDocument
      return document;
  },
  DocumentType: function() {
    // TODO: depends on specific markup
    return document.doctype;
  },
  HTMLAudioElement: function() {
    return document.createElement('audio');
  },
  SpeechSynthesis: function() {
    return window.speechSynthesis;
  },
  Window: function() {
    return window;
  },
  XSLTProcessor: function() {
    return new XSLTProcessor();
  },
};
