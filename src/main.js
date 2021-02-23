import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
//import { OrbitControls } from '../js/three/examples/jsm/controls/OrbitControls.js';
//import { TrackballControls } from '../js/three/examples/jsm/controls/TrackballControls.js';
import { CameraControls, OrbitControls, MapControls, TrackballControls  } from '../js/three/examples/jsm/controls/experimental/CameraControls.js';
import { VRButton } from '../js/three/examples/jsm/webxr/VRButton.js';
import { CSS3DRenderer, CSS3DObject } from '../js/three/examples/jsm/renderers/CSS3DRenderer.js';
import { CSS2DRenderer, CSS2DObject } from '../js/three/examples/jsm/renderers/CSS2DRenderer.js';

import * as FLOORPLANE from './floorplane.js';
import * as OBJECT_3D from './object_3D.js';

import * as CYLINDER_PANO from './cylinder_pano.js';
import * as SPHERE_PANO from './sphere_pano.js';

import * as VIDEO_PANO from './video_pano.js';
import * as VIDEO_LIVE_PANO from './video_live_pano.js';
import * as CCTV_PANO from './cctv_pano.js';

import * as IFRAME_PANO from './iframe_pano.js';

import * as MANAGER from './pano_manager.js';

import * as MAP_TERMINAL from './map_terminal.js';
import * as TILES_MAP from './map_pano.js';
//import * as HARP from './harp_map.js';
import * as IOT_TERMINAL from './iot_terminal.js';
import * as MEDIA_TERMINAL from './media_terminal.js';

import * as LIGHT from './light.js';

//import * as AXIS from '../js/axis/media-stream-library.min.js';
//import * as PLAYER from './axis-simple-player.js';


MANAGER.init()
.then(() => createScene())
.catch((message) => {
	console.log(message);
});


function createScene() {
	// return new Promise((resolve, reject) => {

	const webgl_scene = new THREE.Scene();
	const css2d_scene = new THREE.Scene();
	const css3d_scene = new THREE.Scene();

	const webgl_container = document.getElementById( 'webgl_container' );
	const css2d_container = document.getElementById( 'css2d_container' );
	const css3d_container = document.getElementById( 'css3d_container' );
	const hud_container = document.getElementById( 'hud_container' );

	const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1.0, 2048 );
	camera.position.set(0, 0, 1); // camera looks at 0,0,0 and moves on the unit sphere


	const webgl_renderer = new THREE.WebGLRenderer({ alpha: true });
	webgl_renderer.setSize( window.innerWidth, window.innerHeight );
	webgl_renderer.domElement.style.position = 'absolute';
	webgl_renderer.domElement.style.top = 0;
	webgl_renderer.domElement.style.zIndex = 1;
	webgl_container.appendChild( webgl_renderer.domElement );
	webgl_container.appendChild( VRButton.createButton( webgl_renderer ) );  //document.body

	const css2d_renderer = new CSS2DRenderer();
	css2d_renderer.setSize( window.innerWidth, window.innerHeight );
	css2d_renderer.domElement.style.position = 'absolute';
	css2d_renderer.domElement.style.top = 0;
	css2d_renderer.domElement.style.zIndex = 0;
	css2d_renderer.domElement.style.pointerEvents = 'none';
	css2d_container.appendChild( css2d_renderer.domElement );

	const css3d_renderer = new CSS3DRenderer();
	css3d_renderer.setSize( window.innerWidth, window.innerHeight );
	css3d_renderer.domElement.style.position = 'absolute';
	css3d_renderer.domElement.style.top = 0;
	css3d_renderer.domElement.style.zIndex = 2;
	css3d_renderer.domElement.style.pointerEvents = 'none';
	css3d_container.appendChild( css3d_renderer.domElement );

	hud_container.style.width = window.innerWidth;
	hud_container.style.height = window.innerHeight;
	hud_container.style.position = 'absolute';
	hud_container.style.top = 0;
	hud_container.style.zIndex = 4;


	//const controls = new OrbitControls( camera, renderer.domElement );
	//controls.target = new THREE.Vector3( 0, 2, -256 );  // should point to map terminal
	//controls.enableZoom = false; // no dollying

	const floor_plane = FLOORPLANE.floorplane(webgl_scene);

	var current_webgl_pano = null;
	var current_css3d_pano = null;
	loadNextPano(false, true);

	var current_webgl_object = null;

	const map_terminal = MAP_TERMINAL.addMeshToScene(webgl_scene);
	const iot_terminal = IOT_TERMINAL.addMeshToScene(webgl_scene, css3d_scene);
	const media_terminal = MEDIA_TERMINAL.addMeshToScene(webgl_scene);


	const light = LIGHT.light(webgl_scene);

	// const headUpDiv = document.createElement( 'div' );
	// headUpDiv.className = 'ehfgejkhgf';
	// headUpDiv.style.backgroundColor = 'rgba(100,100,100,0.3)';
	// headUpDiv.style.padding = '5px';
	// headUpDiv.innerText = "HeadUp Display \n";
	// headUpDiv.innerText += "some data \n";
	// headUpDiv.innerText += "some more data \n";
	// headUpDiv.style.border = '2px solid red';
	// headUpDiv.style.borderRadius = '5px';
	// //headUpDiv.style.marginTop = '-1em';
	// const headUpLabel = new CSS2DObject( headUpDiv );
	// headUpLabel.position.set( 0, 0, -5 );
	// css2d_scene.add( headUpLabel );

	// Icons
	const iconControlDiv = document.createElement( 'div' );

	iconControlDiv.className = 'IconControlDiv';
	iconControlDiv.style.backgroundColor = 'rgba(100,100,100,0.3)';
	iconControlDiv.style.padding = '10px';
	iconControlDiv.style.borderRadius = '5px';
	iconControlDiv.style.pointerEvents = 'auto';

	const firstControl = document.createElement( 'img' );
	firstControl.src = '../assets/icons/First.svg' ;

	const previousControl = document.createElement( 'img' );
	previousControl.src = '../assets/icons/Previous.svg' ;
	previousControl.onclick = onPreviousView;

	const nextControl = document.createElement( 'img' );
	nextControl.src = '../assets/icons/Next.svg' ;
	nextControl.onclick = onNextView;

	const lastControl = document.createElement( 'img' );
	lastControl.src = '../assets/icons/Last.svg' ;

	const startControl = document.createElement( 'img' );
	startControl.src = '../assets/icons/Start.svg' ;
	startControl.onclick = () => {
		MEDIA_TERMINAL.startMedia();
	};

	const stopControl = document.createElement( 'img' );
	stopControl.src = '../assets/icons/Stop.svg' ;
	stopControl.onclick = () => {
		MEDIA_TERMINAL.stopMedia();
	};

	const zoomInControl = document.createElement( 'img' );
	zoomInControl.src = '../assets/icons/ZoomIn.svg' ;
	zoomInControl.onclick = () => {
		console.log('onclick');
		camera.zoom += 0.1;
		camera.updateProjectionMatrix();
	};

	const zoomOutControl = document.createElement( 'img' );
	zoomOutControl.src = '../assets/icons/ZoomOut.svg' ;
	zoomOutControl.onclick = () => {
		console.log('onclick');
		camera.zoom -= 0.1;
		camera.updateProjectionMatrix();
	};

	iconControlDiv.appendChild(firstControl);
	iconControlDiv.appendChild(previousControl);
	iconControlDiv.appendChild(nextControl);
	iconControlDiv.appendChild(lastControl);

	iconControlDiv.appendChild(startControl);
	iconControlDiv.appendChild(stopControl);
	iconControlDiv.appendChild(zoomInControl);
	iconControlDiv.appendChild(zoomOutControl);

	hud_container.appendChild( iconControlDiv );

	//const iconControl = new CSS2DObject( iconControlDiv );
	//iconControl.position.set( 0, -1, -5 );
	//css2d_scene.add( iconControl );



	// Controls

	const controls = new TrackballControls( camera, webgl_renderer.domElement );
	controls.enableRotate = true;
	controls.enableZoom = true;
	controls.enablePan = true;



	//controls.target.set(0, 0, -0.1); keep targhet at 0,0,0 camera is at 0,0,1


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

		webgl_renderer.render( webgl_scene, camera );
		css2d_renderer.render( css2d_scene, camera );
		css3d_renderer.render( css3d_scene, camera );

	} );

	function onPreviousView() {
		stopActiveScene();
		loadNextPano(true, false);
		startActiveScene();
	}

	function onNextView() {
		stopActiveScene();
		loadNextPano(true, true);
		startActiveScene();
	}


	async function onDocumentKeyDown(event) {
		var key = event.key;

		if (key == 'f') {
			onNextView();
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

	function loadNextPano(selectNext = true, forward = true) {
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
			MANAGER.selectNextPanoConfiguration(forward);
		}
		if (MANAGER.getSelectedPanoConfiguration().type == 'cylinder2D') {
			current_webgl_pano = CYLINDER_PANO.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'sphere360') {
			current_webgl_pano = SPHERE_PANO.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'Video-2D'
		|| MANAGER.getSelectedPanoConfiguration().type == 'Video-360-2D') {
			current_webgl_pano = VIDEO_PANO.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'cctv') {
			current_webgl_pano = CCTV_PANO.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'Video2D_Stream_Axis') {
			current_webgl_pano = VIDEO_LIVE_PANO.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'Object-3D') {
			current_webgl_object = OBJECT_3D.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'iframe_overlay') {
			current_css2d_pano = IFRAME_PANO.addMeshToScene(css2d_scene);
			// } else if (MANAGER.getSelectedPanoConfiguration().type == 'harp-map') {
			// 	current_webgl_pano = HARP.addMeshToScene(webgl_scene);
		} else if (MANAGER.getSelectedPanoConfiguration().type == 'tiles-map') {
			current_webgl_pano = TILES_MAP.addMeshToScene(webgl_scene);
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
		css2d_renderer.setSize( window.innerWidth, window.innerHeight );
		css3d_renderer.setSize( window.innerWidth, window.innerHeight );

		controls.handleResize();

	}


}
