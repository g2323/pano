import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import * as MAP from './map_state.js';
import * as MANAGER from './pano_manager.js';


export function addMeshToScene(scene) {

			var haov = MANAGER.getSelectedPanoConfiguration().haov;
			if (!haov) { haov = 180; }
			var verticalSize = MANAGER.getSelectedPanoConfiguration().verticalSize;
			if (!verticalSize) { verticalSize = 512; }

			const haov2 = haov / 180.0 * Math.PI;
			const haov_start = Math.PI - (haov2 / 2.0);
			console.log('haov: ' + haov + ' haov2: ' + haov2 + ' haov_start: ' + haov_start);
			//panorama radius top radius bottom height
			const geometry = new THREE.CylinderBufferGeometry(512, 512, verticalSize, 64, 1, true, haov_start, haov2 );
			//invert
			geometry.scale( - 1, 1, 1 );
			//const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			const texture = new THREE.TextureLoader().load( MANAGER.getSelectedPanoConfiguration().url );
			const material = new THREE.MeshBasicMaterial( { map: texture } );
			const pano = new THREE.Mesh( geometry, material );
			pano.position.y = 0.0; //-0.5 + 1.5;
			pano.position.z = 0.0; //1.5; // mittelpunkt Zylinder
			scene.add(pano);

			return pano;
}

export function loadSelectedImage(mesh, scene) {
		loadImage( MANAGER.getSelectedPanoConfiguration().url ).then(image => {
			const texture = mesh.material.map;
			texture.image = image;
			texture.needsUpdate = true;
			if (scene) {
        scene.add(mesh);
      }
		});
}

function loadImage( url ) {
	return new Promise( resolve => {
		console.log( 'loading image ');
		new THREE.ImageLoader().load(url, resolve );
	})
}
