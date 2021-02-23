import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import { CSS2DRenderer, CSS2DObject } from '../js/three/examples/jsm/renderers/CSS2DRenderer.js';
import { CSS3DRenderer, CSS3DObject } from '../js/three/examples/jsm/renderers/CSS3DRenderer.js';

import * as IOT from './socket_server.js';


export function addMeshToScene(webgl_scene, css3d_scene) {

	//map plane
	const iot_control_geometry = new THREE.BoxBufferGeometry( 40.0, 100.0, 5.0 );
	const iot_control_material = new THREE.MeshBasicMaterial( { color: 0x333333 } );
	const iot_control_mesh = new THREE.Mesh( iot_control_geometry, iot_control_material );


	const iot_geometry = new THREE.PlaneGeometry( 32.0, 32.0);
	//const iot_texture = MAP.appMapState().dynamicMapTexture();
	const iot_material = new THREE.MeshBasicMaterial();

	const iot_mesh = new THREE.Mesh( iot_geometry, iot_material );
	iot_mesh.position.y = 30.0;
	iot_mesh.position.z = 2.6;

	const iot_group = new THREE.Group();
	iot_group.add( iot_control_mesh );
	iot_group.add( iot_mesh );
	iot_group.position.x = -100.0;
	iot_group.position.y = -100.0;
	iot_group.position.z = -238.0; // TODO: berechnen
	iot_group.rotation.y = Math.PI / 8.0; // -0.1;
	iot_group.receiveShadow = true; //default is false

	webgl_scene.add( iot_group );



	const iotDiv = document.createElement( 'div' );
	iotDiv.className = 'iotDiv';
	iotDiv.style.backgroundColor = 'rgba(100,100,100,0.3)';
	iotDiv.style.padding = '5px';
	iotDiv.style.fontSize = 'xx-small'
	iotDiv.innerText = "IoT Display \n";
	//iotDiv.style.border = '2px solid red';
	iotDiv.style.borderRadius = '5px';

	iotDiv.style.width = '120px';
	iotDiv.style.height = '120px';


	const iotLabel = new CSS3DObject( iotDiv );

	iotLabel.scale.x = 0.25;
	iotLabel.scale.y = 0.25;
	iotLabel.position.set( -100, -71, -238 );
	iotLabel.rotation.y = Math.PI / 8.0; // -0.1;
	css3d_scene.add( iotLabel );


	IOT.initIoTSocket();

	IOT.startIoTSocketEvent(function(from, msg) {
		//console.log('Message from ' + from + ': ' + msg);
		if (iotDiv.innerText.length > 256) {
			iotDiv.innerText = "";
		}

		//console.log('Message from ' + from + ': ' + msg);
		//console.log(msg);

		if (msg && msg[0]) {
			iotDiv.innerText += from + ': ' + msg[0].class + ' (' + (parseFloat(msg[0].score) * 100.0).toFixed(0) + '%)';
			iotDiv.innerText += "\n";
		}

	});


	return iot_group;
}
