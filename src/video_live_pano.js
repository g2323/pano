import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import * as MAP from './map_state.js';
import * as MANAGER from './pano_manager.js';
import * as AXIS from '../js/axis/media-stream-library.min.js';
//import * as PLAYER from './axis-simple-player.js';




export function addMeshToScene(scene) {

	//video
	const video = document.getElementById( 'video' );
	const host = MANAGER.getSelectedPanoConfiguration().url;
	const encoding = MANAGER.getSelectedPanoConfiguration().encoding;


	// const canvas = document.createElement( 'canvas' );
	// canvas.setAttribute('width', 640);
	// canvas.setAttribute('height', 480);
	// canvas.setAttribute('id', 'video_canvas');
	// const context2d = canvas.getContext( '2d' );
	//const texture = new THREE.CanvasTexture(context2d.canvas);

	//panorama radius top radius bottom height
	const geometry = new THREE.CylinderBufferGeometry(512, 512, 512, 64, 1, true, Math.PI * 0.8, Math.PI * 0.4 );

	//invert
	geometry.scale( - 1, 1, 1 );

	const texture = new THREE.VideoTexture( video );
	const material = new THREE.MeshBasicMaterial( { map: texture } );
	const pano = new THREE.Mesh( geometry, material );
	pano.position.y = 0.0; //-0.5 + 1.5;
	pano.position.z = 0.0; //1.5; // mittelpunkt Zylinder
	scene.add(pano);

	//startScene();

	return pano;

}

export async function startScene() {
	const host = MANAGER.getSelectedPanoConfiguration().url;
	const encoding = MANAGER.getSelectedPanoConfiguration().encoding;

	await authorize(host);
	let pipeline = play(host, encoding);
}

export function stopScene() {
	const video = document.getElementById( 'video' );
	video.pause();
	video.currentTime = 0;
}
