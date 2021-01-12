import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';

export function floorplane(scene) {
			//floorplane
      const floor_geometry = new THREE.PlaneGeometry( 1024, 1024);
      const floor_material = new THREE.MeshBasicMaterial( {color: 0xD3D3D3, side: THREE.DoubleSide} );
      const floor_plane = new THREE.Mesh( floor_geometry, floor_material );
      floor_plane.rotation.x=MathUtils.degToRad(90);
      floor_plane.rotation.z=MathUtils.degToRad(90);
      floor_plane.receiveShadow = true; //default is false
			floor_plane.position.y = -256.0; // -0.5;
      floor_plane.position.z = -512.0; // -0.5;
			scene.add(floor_plane);

			return floor_plane;
}
