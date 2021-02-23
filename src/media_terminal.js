import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import { CSS2DRenderer, CSS2DObject } from '../js/three/examples/jsm/renderers/CSS2DRenderer.js';
import { CSS3DRenderer, CSS3DObject } from '../js/three/examples/jsm/renderers/CSS3DRenderer.js';

import { getAppState } from './app_state.js';
import * as IOT from './socket_server.js';

//module globals
var timer = null;
var imageCapture = null;
const video = document.createElement( 'video' );
const media_canvas = getAppState().offscreenCanvasMediaCapture();
const media_context = media_canvas.getContext( '2d' );
const media_texture = new THREE.CanvasTexture(media_context.canvas);
var prediction_box = null;


export function addMeshToScene(webgl_scene) {

	//map plane
	const media_control_geometry = new THREE.BoxBufferGeometry( 40.0, 100.0, 5.0 );
	const media_control_material = new THREE.MeshBasicMaterial( { color: 0x333333 } );
	const media_control_mesh = new THREE.Mesh( media_control_geometry, media_control_material );


	const media_geometry = new THREE.PlaneGeometry( 32.0, 32.0);
	//const media_texture = new THREE.VideoTexture( video );



	const media_material = new THREE.MeshBasicMaterial( { map: media_texture } );

	const media_mesh = new THREE.Mesh( media_geometry, media_material );
	media_mesh.position.y = 30.0;
	media_mesh.position.z = 2.6;

	const media_group = new THREE.Group();
	media_group.add( media_control_mesh );
	media_group.add( media_mesh );
	media_group.position.x = +100.0;
	media_group.position.y = -100.0;
	media_group.position.z = -238.0; // TODO: berechnen
	media_group.rotation.y = Math.PI / -8.0; // -0.1;
	media_group.receiveShadow = true; //default is false

	webgl_scene.add( media_group );

	return media_group;
}

export async function startMedia() {

	var constraints = { audio: false, video: { width: 640, height: 480 } };

	navigator.mediaDevices.getUserMedia(constraints)
	.then(function(mediaStream) {
		//var video = document.getElementById( 'video' );

		video.addEventListener('play', () => {
			function drawToCanvas() {
				media_context.drawImage(video, 0, 0, media_canvas.width, media_canvas.height);

				if (prediction_box) {
					media_context.beginPath();
					media_context.lineWidth = "6";
					media_context.strokeStyle = "#00ff00";
					media_context.rect(4 * prediction_box[0], 4 * prediction_box[1], 4 * prediction_box[2], 4 * prediction_box[3]);
					media_context.stroke();
				}

				media_texture.needsUpdate = true;
				requestAnimationFrame(drawToCanvas);
			}
			requestAnimationFrame(drawToCanvas);
		});

		video.srcObject = mediaStream;
		video.onloadedmetadata = function(e) {
			video.play();
		};

		IOT.initIoTSocket();
		IOT.startIoTSocketEvent(function(from, msg) {
			//console.log('prediction_box');
			if (msg && msg[0]) {
				prediction_box = msg[0].bbox;
				//console.log(prediction_box);
			}
		});

		console.log('getVideoTrack');
		console.log(mediaStream);
		var track = mediaStream.getVideoTracks()[0];
		console.log(track);

		// check if ImageCapture is supported
		if ('ImageCapture' in window) {
			console.log('ImageCapture supported');

			imageCapture = new ImageCapture(track);

			timer = setInterval(() => {
				imageCapture.grabFrame()
				.then(imageBitmap => {
					//const canvas = getAppState().offscreenCanvasMediaCapture();
					//canvas.width = imgData.width;
					//canvas.height = imgData.height;
					//canvas.getContext('2d').drawImage(imageBitmap, 0, 0);
					const dataURL = media_canvas.toDataURL("image/jpeg", 0.25);
					IOT.emitIoTSocket(dataURL);
					//console.log(dataURL);
					//console.log(imageBitmap);
				})
				.catch(function(err) { console.log(err.name + ": " + err.message); });
			}, 5000);
		}
		else {
			console.log('ImageCapture not supported');

			timer = setInterval(() => {
				//const canvas = getAppState().offscreenCanvasMediaCapture();
				//canvas.getContext('2d').drawImage(video, 0, 0, 640, 480);
				const dataURL = media_canvas.toDataURL("image/jpeg", 0.25);
				IOT.emitIoTSocket(dataURL);
				//console.log(dataURL.length);

			}, 5000);
		}


	})
	.catch(function(err) { console.log(err.name + ": " + err.message); });
}

export async function stopMedia() {
	if (timer) {
		clearInterval(timer);
	}

	//const video = document.getElementById( 'video' );
	video.pause();
	video.currentTime = 0;
	video.src = "";
	if (video.srcObject) {
		var stream = video.srcObject;
		stream.getTracks().forEach(track => track.stop());
		video.srcObject = null;
	}
}
