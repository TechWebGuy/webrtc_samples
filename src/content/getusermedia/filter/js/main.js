/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var snapshotButton = document.querySelector('button#snapshot');
var filterButton = document.querySelector('button#filter');

// Put variables in global scope to make them available to the browser console.
var video = window.video = document.querySelector('video');
var canvas = window.canvas = document.querySelector('canvas');
canvas.width = 480;
canvas.height = 360;

var filters = ['blur', 'grayscale', 'invert', 'sepia', 'none'];

snapshotButton.onclick = function() {
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width,
      canvas.height);
};

filterButton.onclick = function() {
  var newIndex = (filters.indexOf(canvas.className) + 1) % filters.length;
  video.className = filters[newIndex];
  canvas.className = filters[newIndex];
};

var constraints = {
  audio: false,
  video: true
};

function successCallback(stream) {
  window.stream = stream; // make stream available to browser console
  attachMediaStream(video, stream);
}

function errorCallback(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.getUserMedia(constraints, successCallback, errorCallback);
