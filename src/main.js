import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import { OrbitControls } from '../js/three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from '../js/three/examples/jsm/controls/TrackballControls.js';
import { VRButton } from '../js/three/examples/jsm/webxr/VRButton.js';
import { CSS3DRenderer, CSS3DObject } from '../js/three/examples/jsm/renderers/CSS3DRenderer.js';

import * as FLOORPLANE from './floorplane.js';
import * as OBJECT_3D from './object_3D.js';

import * as CYLINDER_PANO from './cylinder_pano.js';
import * as SPHERE_PANO from './sphere_pano.js';

import * as VIDEO_PANO from './video_pano.js';
import * as VIDEO_LIVE_PANO from './video_live_pano.js';

import * as IFRAME_PANO from './iframe_pano.js';

import * as MANAGER from './pano_manager.js';

import * as TERMINAL from './map_terminal.js';
import * as LIGHT from './light.js';

//import * as AXIS from '../js/axis/media-stream-library.min.js';
//import * as PLAYER from './axis-simple-player.js';


main();

function main() {

	MANAGER.parseImages();

	const webgl_scene = new THREE.Scene();
	const css3d_scene = new THREE.Scene();

	const webgl_container = document.getElementById( 'webgl_container' );
	const css3d_container = document.getElementById( 'css3d_container' );

	const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1.0, 1024 );
	camera.position.set(0, 0, 1);


	const webgl_renderer = new THREE.WebGLRenderer({ alpha: true });
	webgl_renderer.setSize( window.innerWidth, window.innerHeight );
	webgl_renderer.domElement.style.position = 'absolute';
	webgl_renderer.domElement.style.top = 0;
	webgl_container.appendChild( webgl_renderer.domElement );
	webgl_container.appendChild( VRButton.createButton( webgl_renderer ) );  //document.body


	const css3d_renderer = new CSS3DRenderer();
	css3d_renderer.setSize( window.innerWidth, window.innerHeight );
	css3d_renderer.domElement.style.position = 'absolute';
	css3d_renderer.domElement.style.top = 0;
	css3d_container.appendChild( css3d_renderer.domElement );






	//const controls = new OrbitControls( camera, renderer.domElement );
	//controls.target = new THREE.Vector3( 0, 2, -256 );  // should point to map terminal
	//controls.enableZoom = false; // no dollying



	const floor_plane = FLOORPLANE.floorplane(webgl_scene);

	var current_webgl_pano = null;
	var current_css3d_pano = null;
	loadNextPano(false);

	var current_webgl_object = null;

	const terminal = TERMINAL.addMeshToScene(webgl_scene);
	const light = LIGHT.light(webgl_scene);

	const controls = new TrackballControls( camera, webgl_renderer.domElement );
	controls.noRotate = false;
	controls.noZoom = false;
	controls.noPan = true;


	document.addEventListener("keydown", onDocumentKeyDown, false);
	window.addEventListener( 'resize', onWindowResize, false );

	webgl_renderer.xr.enabled = true;
	//camera.position.set(0, 1.5, 3);


	controls.update();

	// controls
	//controls.maxPolarAngle = Math.PI * 0.5;
	//controls.minDistance = 1000;
	//controls.maxDistance = 5000;


	webgl_renderer.setAnimationLoop( function () {

		const object_3D = webgl_scene.getObjectByName('Object_3D');
		if (object_3D) {
			object_3D.rotation.y += MathUtils.degToRad(0.1);
		}

		controls.update();

		//TERMINAL.getDynamixMapTexture().needsUpdate = true;
		webgl_renderer.render( webgl_scene, camera );
		css3d_renderer.render( css3d_scene, camera );

	} );

	async function onDocumentKeyDown(event) {
		var key = event.key;

		if (key == 'f') {
			stopActiveScene();
			loadNextPano();
			startActiveScene();
		}
	}

	function startActiveScene() {
		if (MANAGER.getSelectedPanoConfiguration().type == 'video2D'
		|| MANAGER.getSelectedPanoConfiguration().type == 'Video-360-2D') {
			VIDEO_PANO.startScene();
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'Video2D_Stream_Axis') {
			VIDEO_LIVE_PANO.startScene();
		}
	}

	function stopActiveScene() {
		if (MANAGER.getSelectedPanoConfiguration().type == 'video2D'
		|| MANAGER.getSelectedPanoConfiguration().type == 'Video-360-2D') {
			VIDEO_PANO.stopScene();
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'Video2D_Stream_Axis') {
			VIDEO_LIVE_PANO.stopScene();
		}
	}

	function loadNextPano(selectNext = true) {
		console.log('loadNextPano');
		if (current_webgl_pano) {
			webgl_scene.remove(current_webgl_pano);
			current_webgl_pano = null;
		}
		if (current_webgl_object) {
			webgl_scene.remove(current_webgl_object);
			current_webgl_object = null;
		}
		if (current_css3d_pano) {
			css3d_scene.remove(current_css3d_pano);
			current_css3d_pano = null;
		}
		if (selectNext) {
			MANAGER.selectNextPanoConfiguration();
		}
		if (MANAGER.getSelectedPanoConfiguration().type == 'cylinder2D') {
			current_webgl_pano = CYLINDER_PANO.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'sphere360') {
			current_webgl_pano = SPHERE_PANO.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'Video-2D'
		|| MANAGER.getSelectedPanoConfiguration().type == 'Video-360-2D') {
			current_webgl_pano = VIDEO_PANO.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'Video2D_Stream_Axis') {
			current_webgl_pano = VIDEO_LIVE_PANO.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'Object-3D') {
			current_webgl_object = OBJECT_3D.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'iframe_overlay') {
			current_css3d_pano = IFRAME_PANO.addMeshToScene(css3d_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'url') {
			// this never returns
			window.location.assign(MANAGER.getSelectedPanoConfiguration().url);
		}
	}

	function onWindowResize() {

		const aspect = window.innerWidth / window.innerHeight;

		camera.aspect = aspect;
		camera.updateProjectionMatrix();

		webgl_renderer.setSize( window.innerWidth, window.innerHeight );
		css3d_renderer.setSize( window.innerWidth, window.innerHeight );

		controls.handleResize();

	}


}
