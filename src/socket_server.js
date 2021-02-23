import * as MAP from './map_state.js';

import '../node_modules/socket.io-client/dist/socket.io.min.js';
// socket client for chat server

// module globals

var socket = null;

export function initIoTSocket() {

  if (!socket) {

    console.log('try to connect');

    socket = io('http://applied-math-vision.com:3010/');
    //socketEvent = io('https://demo.psitms.de/');
    //socketEvent = io('https://pano.g2323.org/');


    socket.on('connect', function() {
      console.log('connect');
    });

    socket.on('event', function(data) {
      console.log('event');
    });

    socket.on('disconnect', function() {
      socket = null;
      console.log('disconnect');
    });

  }

}



export function startIoTSocketEvent(func) {

  socket.on('IoT_Message', func);

  socket.on('CCTV_Message', function(from, msg) {
    console.log('Message from ' + from + ': ' + msg);
  });
}


export function stopIoTSocket() {
  if (socket) {
    socket.emit('disconnect');
  }
}

export function emitIoTSocket(data) {

  if (socket) {

    const user = 'htn';
    const msg = {
      image: data
    };

    //console.log('emit');
    try {
      socket.emit('CCTV_Message', user, JSON.stringify(msg));
    } catch(err) {
      console.error('emit: ' + event);
      console.error(err);
    }
  }
  else {
    console.log('no socket');
  }

}
