import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';

export function cylinderpano(scene) {

			//panorama
			const geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 64, 1, true, Math.PI / 2.0, Math.PI * 1.1 );
			//invert
			geometry.scale( - 1, 1, 1 );
			//const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			const texture = new THREE.TextureLoader().load( './assets/textures/PANO_001.jpeg' );
			const material = new THREE.MeshBasicMaterial( { map: texture } );
			const pano = new THREE.Mesh( geometry, material );
			//cube.position.y = 0.5;
			scene.add(pano);

			return pano;
}
