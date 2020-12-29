import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';


export function light(scene) {

	//light
	//color,intensity,range,decay
	const pointLight = new THREE.PointLight(0xFFFFFF,10,0,2);

	// set its position
	pointLight.position.x = 2;
	pointLight.position.y = 3;
	pointLight.position.z = -2;

	pointLight.shadow.mapSize.width = 512; // default
	pointLight.shadow.mapSize.height = 512; // default
	pointLight.shadow.camera.near = 0.5; // default
	pointLight.shadow.camera.far = 500; // default

	scene.add(pointLight);

	return pointLight;
}
