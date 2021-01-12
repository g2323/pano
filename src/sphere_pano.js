import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import * as EXIFR from '../js/exifr/dist/lite.esm.js';
import * as MAP from './map_state.js';
import * as MANAGER from './pano_manager.js';


export function addMeshToScene(scene) {

  var radius = MANAGER.getSelectedPanoConfiguration().radius;
  if (!radius) { radius = 512; }
  var position_y = MANAGER.getSelectedPanoConfiguration().position_y;
  if (!position_y) { position_y = 0; }

  const panoSphereGeo = new THREE.SphereBufferGeometry( radius, 256, 256 );
  panoSphereGeo.scale( - 1, 1, 1 );

  const panoSphereTexture = new THREE.TextureLoader().load( MANAGER.getSelectedPanoConfiguration().url );
  //const panoSphereTexture = new THREE.TextureLoader().load( './assets/textures/Feld.jpg' );
  const panoSphereMaterial = new THREE.MeshBasicMaterial( { map: panoSphereTexture } );
  const pano = new THREE.Mesh( panoSphereGeo, panoSphereMaterial );
  pano.position.y = position_y;
  scene.add( pano );

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
