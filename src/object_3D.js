import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import { GLTFLoader } from '../js/three/examples/jsm/loaders/GLTFLoader.js';

import * as MANAGER from './pano_manager.js';


export function addMeshToScene(scene) {

  const url = MANAGER.getSelectedPanoConfiguration().url;
  const loader = new GLTFLoader();
  const group = new THREE.Group();

  var model = null;

  loader.load( url, function ( gltf ) {
    model = gltf.scene;
    model.castShadow = true; //default is false
    model.receiveShadow = false; //default
    //model.position.set( 60.0, -150.0, -256.0 );
    //model.scale.set( 50.0, 50.0, 50.0 );
    model.name = 'Object_3D';

    group.add( model );

  }, undefined, function ( error ) {

    console.error( error );

  } );

  group.position.set( 40.0, -50.0, -350.0 );
  group.scale.set( 150.0, 150.0, 150.0 );
  scene.add( group );

  return group;
}
