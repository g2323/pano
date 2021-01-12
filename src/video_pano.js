import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';

import * as MANAGER from './pano_manager.js';


export function addMeshToScene(scene) {

	//video
	const video = document.getElementById( 'video' );
	const url = MANAGER.getSelectedPanoConfiguration().url;
	const type = MANAGER.getSelectedPanoConfiguration().type;

	//const source = document.createElement('source');
	//source.setAttribute('src', './assets/video/e-go-1.mp4');
	video.src = url;
	//video.appendChild(source);
	//video.play();

	//panorama radius top radius bottom height
	let geometry = null;
	if (type == 'Video-2D') {
		geometry = new THREE.CylinderBufferGeometry(512, 512, 356, 64, 1, true, Math.PI * 0.8, Math.PI * 0.4 );
	} else if (type == 'Video-360-2D') {
		geometry = new THREE.SphereBufferGeometry( 512, 256, 256 );
	}

	//invert
	geometry.scale( - 1, 1, 1 );

	const texture = new THREE.VideoTexture( video );
	const material = new THREE.MeshBasicMaterial( { map: texture } );
	const pano = new THREE.Mesh( geometry, material );
	pano.position.y = 0.0;
	pano.position.z = 0.0;
	scene.add(pano);

	return pano;

}

export async function startScene() {
	const video = document.getElementById( 'video' );
	video.play();
}

export function stopScene() {
	const video = document.getElementById( 'video' );
	video.pause();
	video.currentTime = 0;
	video.src = null;
}
