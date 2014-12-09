/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* More information about these options at jshint.com/docs/options */

/* globals displayError, displayStatus */
/* exported hasTurnServer, requestTurnServers */

'use strict';

function hasTurnServer(params) {
  var iceServers = params.peerConnectionConfig.iceServers;
  for (var i = 0, len = iceServers.length; i < len; i++) {
    if (iceServers[i].urls.substr(0, 5) === 'turn:') {
      return true;
    }
  }
  return false;
}

// Returns a list of turn servers after requesting it from CEOD.
function requestTurnServers(turnRequestUrl) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status !== 200) {
        reject(Error('Request error: ' + xhr.status));
        return;
      }
      var turnServerResponse = parseJSON(xhr.responseText);
      if (!turnServerResponse) {
        reject(Error('Error parsing response JSON: ' + xhr.responseText));
        return;
      }
      var turnServers = createIceServers(turnServerResponse.uris,
          turnServerResponse.username, turnServerResponse.password);
      if (!turnServers) {
        reject(Error('Error creating ICE servers from response.'));
        return;
      }
      trace('Retrieved TURN server information.');
      resolve(turnServers);
    };
    xhr.open('GET', turnRequestUrl, true);
    xhr.send();
  });
}

function parseJSON(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    trace('Error parsing json: ' + json);
  }
  return null;
}
