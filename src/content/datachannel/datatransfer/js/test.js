/*
 *  Copyright (c) 2018 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
export default {
  'It should transfer data over data channel': (browser) => {
    const path = '/src/content/datachannel/datatransfer/index.html';
    const url = 'file://' + process.cwd() + path;

    browser
      .url(url)
      .click('#sendTheData')
      .pause(1000)
      .assert.value('#receiveProgress', '16777200')
      .end();
  }
};