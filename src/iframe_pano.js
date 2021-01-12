import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import { CSS3DRenderer, CSS3DObject } from '../js/three/examples/jsm/renderers/CSS3DRenderer.js';

import * as MANAGER from './pano_manager.js';


export function addMeshToScene(scene) {

	const url = MANAGER.getSelectedPanoConfiguration().url;

	const container = document.getElementById( 'css_container' );

	const div = document.createElement( 'div' );
	div.style.width = '100%';
	div.style.height = '100%';
	div.style.backgroundColor = '#000';

	const iframe = document.createElement( 'iframe' );
	iframe.style.width = '100%';
	iframe.style.height = '100%';
	iframe.style.border = '0px';
	iframe.src = [ url ];
	div.appendChild( iframe );

	const pano = new CSS3DObject( div );
	pano.position.set( 0.0, 0.0, -800.0 );

	scene.add(pano);

	return pano;

}

export function startScene() {

}

export function stopScene() {

}
