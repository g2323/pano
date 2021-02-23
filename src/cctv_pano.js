import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import * as MANAGER from './pano_manager.js';

import { getAppState } from './app_state.js';

export function addMeshToScene(scene) {

	setup();

	const geometry = new THREE.CylinderBufferGeometry(512, 512, 480, 64, 1, true, 0.8 * Math.PI, 0.4 * Math.PI );
	geometry.scale( - 1, 1, 1 );
	const texture = getAppState().dynamicMapTextureCCTV();
	const material = new THREE.MeshBasicMaterial( { map: texture } );
	//map_texture.needsUpdate = true; // ???
	//map_material.needsUpdate = true; // ???
	const mesh = new THREE.Mesh( geometry, material );
	mesh.position.y = -100.0;
	mesh.position.z = 0.0;

	scene.add( mesh );
	//document.addEventListener("keydown", onDocumentKeyDown, false);

	return mesh;
}

// Initialize WebSocket connection and event handlers
function setup() {

	const wsUri = MANAGER.getSelectedPanoConfiguration().url;

	const canvas = getAppState().offscreenCanvasCCTV();
	const context2d = canvas.getContext( '2d' );
	const map_texture = getAppState().dynamicMapTextureCCTV();

	const ws = new WebSocket(wsUri);

	// Listen for the connection open event then call the sendMessage function
	ws.onopen = function(e) {
		var s = "www client connected";
		sendMessage(s);
		log(s);
	}

	// Listen for the close connection event
	ws.onclose = function(e) {
		log("Disconnected: " + e.reason);
	}

	// Listen for connection errors
	ws.onerror = function(e) {
		log("Error ");
	}

	// Listen for new messages arriving at the client
	ws.onmessage = function(e) {
		var s = e.data.length;
		if (typeof e.data === "string") {
			if (s < 1024) {
				if (e.data == "meta data []") {
					//
					// Image Processing on SERVER
					//
					//let dst = cv.imread("dstCanvas");
				} else {
					log("Message received:["+s+"] "+e.data);
				}
			} else {
				//
				//log("Message received:["+s+"] (image)"); BAUSTELLE

				// html "paint"
				//var imagePlaceholder = document.getElementById('image-placeholder');
				//var image = '<img src="' + e.data + '" />';
				//imagePlaceholder.innerHTML = image;

				var serverAnswer = JSON.parse(e.data);
				var img = serverAnswer.image;
				var rects = serverAnswer.rects;

				var image = new Image();
				image.src = img;

				image.onload = function() {
					//var metaData = e.data.substring(s-256,s);
					//var rects = JSON.parse(metaData);
					context2d.drawImage(image, 0, 0);
					for (var i = 0; i<rects.length - 1; i++) {
						//
						var r = rects[i];
						context2d.beginPath();
						context2d.lineWidth = "6";
						context2d.strokeStyle = "#00ff00";
						context2d.rect(r.x,r.y,r.width,r.height);
						context2d.stroke();
					}


					map_texture.needsUpdate = true;
				};

				//
				// Image Processing on CLIENT
				//
				// try {
				// 	let src = cv.imread("srcCanvas");
				// 	let dst = new cv.Mat();
				// 	cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
				// 	let pos = new cv.Rect(100, 100);
				// 	let scalar = new cv.Scalar(0, 255, 0, 0);
				// 	//
				// 	// draw line with opencv
				// 	//
				// 	cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
				// 	cv.line(dst, new cv.Point(xCnt, 0), new cv.Point(xCnt, 360), [0, 255, 0, 255], 3);
				// 	xCnt+=1;
				// 	if (xCnt > 640) {
				// 		xCnt = 0;
				// 	}
				// 	cv.imshow('dstCanvas', dst);
				// 	src.delete();
				// 	dst.delete();
				// } catch (error) {
				// 	log(error);
				// }
				//
				// drawline with canvas
				//
				// var dst_canvas = document.getElementById("dstCanvas");
				// var context = dst_canvas.getContext('2d');
				// context.lineWidth = 4;
				// context.strokeStyle = 'red';
				// context.beginPath();
				// context.moveTo(0,yCnt);
				// context.lineTo(640,yCnt);
				// context.stroke();
				// yCnt+=1;
				// if (yCnt > 400) {
				// 	yCnt = 0;
				// }
			}
		} else {
			//if (e.data instanceof Blob) BAUSTELLE
		}
	}

	// Send a message on the WebSocket.
	function sendMessage(msg){
		ws.send(msg);
		log("Message sent: " + msg);
	}

	function log(s) {
		console.log(s);
	}

}
