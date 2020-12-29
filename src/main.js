import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import { OrbitControls } from '../js/three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from '../js/three/examples/jsm/webxr/VRButton.js';

import * as FLOORPLANE from './floorplane.js';
import * as PANO from './cylinder_pano.js';
import * as TERMINAL from './map_terminal.js';
import * as LIGHT from './light.js';

main();

function main() {

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
	const renderer = new THREE.WebGLRenderer();
	const controls = new OrbitControls( camera, renderer.domElement );

	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );
	document.body.appendChild( VRButton.createButton( renderer ) );

	const floor_plane = FLOORPLANE.floorplane(scene);
	const pano = PANO.cylinderpano(scene);
	TERMINAL.mapterminal(scene);
	const light = LIGHT.light(scene);


	renderer.xr.enabled = true;
	camera.position.set(0, 0, 1);
	controls.update();

	// controls
	//controls.maxPolarAngle = Math.PI * 0.5;
	//controls.minDistance = 1000;
	//controls.maxDistance = 5000;


	renderer.setAnimationLoop( function () {
		//if (model) {
		//        model.rotation.y += MathUtils.degToRad(0.01);
		//}

		controls.update();
		//TERMINAL.getDynamixMapTexture().needsUpdate = true;
		renderer.render( scene, camera );

	} );
}
