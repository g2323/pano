import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import * as MAP from './map_state.js';

export function mapterminal(scene) {

	//map plane
	const map_control_geometry = new THREE.BoxBufferGeometry( 0.4 , 0.5, 0.1 );
	const map_control_material = new THREE.MeshBasicMaterial( { color: 0x333333 } );
	const map_control_mesh = new THREE.Mesh( map_control_geometry, map_control_material );

	loadTextures();

	const map_geometry = new THREE.PlaneGeometry( 0.36, 0.36);
	const map_texture = MAP.appMapState().dynamicMapTexture();
	const map_material = new THREE.MeshBasicMaterial( { map: map_texture } );
	//map_texture.needsUpdate = true; // ???
	//map_material.needsUpdate = true; // ???
	const map_mesh = new THREE.Mesh( map_geometry, map_material );
	map_mesh.position.y = 0.05;
	map_mesh.position.z = 0.06;

	const map_group = new THREE.Group();
	map_group.add( map_control_mesh );
	map_group.add( map_mesh );
	map_group.position.y = -0.25;
	map_group.position.z = -0.1;
	map_group.receiveShadow = true; //default is false

	scene.add( map_group );
	document.addEventListener("keydown", onDocumentKeyDown, false);
}


function loadTextures() {
	const loader = new THREE.ImageLoader();
	const canvas = MAP.appMapState().offscreenMapCanvas();
	const context2d = canvas.getContext( '2d' );
	const map_texture = MAP.appMapState().dynamicMapTexture();

	const zoomLevel = MAP.appMapState().zoomLevel;
	const url = MAP.appMapState().tilesServiceUrl;

	console.log( 'loadTextures ' + zoomLevel + ' from ' + url);
	// tiles are 256x256, web mercator

	if (zoomLevel == 0) {
		const image0 = loader.load(url + '' + zoomLevel + '/0/0.png', function ( image ) { textureOnLoad(image, 128, 128, 256, 256, 0, 0); } );

	} else if (zoomLevel > 0) {

		// load a image resource
		//    00 10
		//    01 11
		var tile_00x =  0;
		var tile_00y =  0;

		if (zoomLevel > 1) {

			tile_00x =  longitude2tile(MAP.appMapState().centerLongitude, zoomLevel);
			tile_00y =  latitude2tile(MAP.appMapState().centerLatitude, zoomLevel);

			// in welchem Quadranten sind wir gelandet?
			const longMin = longitude2norm(tile2longitude(tile_00x, zoomLevel));
			const longMax = longitude2norm(tile2longitude(tile_00x + 1, zoomLevel));
			const latMin = latitude2norm(tile2latitude(tile_00y, zoomLevel));
			const latMax = latitude2norm(tile2latitude(tile_00y + 1, zoomLevel));
//TODO: erst projezieren...
			const left = (longitude2norm(MAP.appMapState().centerLongitude) <= ((longMin + longMax)/2.0))? true : false;
			const upper = (latitude2norm(MAP.appMapState().centerLatitude) <= ((latMin + latMax)/2.0))? true : false;

			if (left && tile_00x > 0) {
				tile_00x -= 1.0;
			}
			if (upper && tile_00y > 0) {
				tile_00y -= 1.0;
			}

		}

		const tile_00 = tile_00x.toFixed(0) + '/'+ tile_00y.toFixed(0) + '.png';
		const tile_10 = (tile_00x + 1).toFixed(0) + '/'+ tile_00y.toFixed(0) + '.png';
		const tile_01 = tile_00x.toFixed(0) + '/'+ (tile_00y + 1).toFixed(0) + '.png';
		const tile_11 = (tile_00x + 1).toFixed(0) + '/'+ (tile_00y + 1).toFixed(0) + '.png';

		//get relative position
		const longMin = longitude2norm(tile2longitude(tile_00x, zoomLevel));
		const longMax = longitude2norm(tile2longitude(tile_00x + 2, zoomLevel));
		const latMin = latitude2norm(tile2latitude(tile_00y + 2, zoomLevel));
		const latMax = latitude2norm(tile2latitude(tile_00y, zoomLevel));

		//TODO: erst projezieren...

		const dx = (longitude2norm(MAP.appMapState().centerLongitude) - longMin) / (longMax - longMin);
		const dy = (latitude2norm(MAP.appMapState().centerLatitude) - latMin) / (latMax - latMin);


		MAP.appMapState().dx = dx;
		MAP.appMapState().dy = dy;

		const image00 = loader.load(url + '' + zoomLevel + '/' + tile_00, function ( image ) { textureOnLoad(image, 0, 0, 256, 256, dx, dy); } );
		const image10 = loader.load(url + '' + zoomLevel + '/' + tile_10, function ( image ) { textureOnLoad(image, 256, 0, 256, 256, dx, dy); } );
		const image01 = loader.load(url + '' + zoomLevel + '/' + tile_01, function ( image ) { textureOnLoad(image, 0, 256, 256, 256, dx, dy); } );
		const image11 = loader.load(url + '' + zoomLevel + '/' + tile_11, function ( image ) { textureOnLoad(image, 256, 256, 256, 256, dx, dy); } );



		map_texture.needsUpdate = true;
	};

	function textureOnLoad ( image, x, y, w, h, dx, dy) {
		console.log( 'textureOnLoad ');
		//const map_texture = dynamicMapTexture();
		context2d.drawImage( image, x, y, w, h );

		map_texture.repeat.x = 0.4;
		map_texture.repeat.y = 0.4;
		map_texture.offset.x = dx- MAP.appMapState().centerViewX + ((1.0 - map_texture.repeat.x) / 2.0);
		map_texture.offset.y = dy - MAP.appMapState().centerViewY + ((1.0 - map_texture.repeat.y) / 2.0);

		map_texture.needsUpdate = true;
	}
}




function onDocumentKeyDown(event) {
	var key = event.key;
	const map_texture = MAP.appMapState().dynamicMapTexture();

	if (key == 'i') {
		// zoom in
		map_texture.repeat.x = map_texture.repeat.x / 1.05;
		map_texture.repeat.y = map_texture.repeat.y / 1.05;

		//console.log('repeat.x ' + map_texture.repeat.x + ' offset.x ' + map_texture.offset.x)
	} else if (key == 'o') {
		// zoom out
		map_texture.repeat.x = map_texture.repeat.x * 1.05;
		map_texture.repeat.y = map_texture.repeat.y * 1.05;

		console.log('repeat.x ' + map_texture.repeat.x + ' offset.x ' + map_texture.offset.x)
	} else if (key == 'h') {
		// pan left
		MAP.appMapState().centerViewX -= 0.01;
	} else if (key == 'j') {
		// pan right
		// map_texture.offset.x = map_texture.offset.x + 0.1;
		MAP.appMapState().centerViewX += 0.01;
	} else if (key == 'u') {
		// pan up
		MAP.appMapState().centerViewY -= 0.01;
	} else if (key == 'n') {
		// pan down
		MAP.appMapState().centerViewY += 0.01;
	}

	const dx = MAP.appMapState().dx;
	const dy = MAP.appMapState().dy;

	map_texture.offset.x = dx - MAP.appMapState().centerViewX + ((1.0 - map_texture.repeat.x) / 2.0);
	map_texture.offset.y = dy - MAP.appMapState().centerViewY + ((1.0 - map_texture.repeat.y) / 2.0);


	// so was in der Richtung
	if (map_texture.repeat.x < 0.25 && MAP.appMapState().zoomLevel < 22) {
		MAP.appMapState().zoomLevel++;
		loadTextures();
		console.log( 'update Textures ');
	} else if (map_texture.repeat.x > 0.55 && MAP.appMapState().zoomLevel > 1) {
		MAP.appMapState().zoomLevel--;
		loadTextures();
		console.log( 'update Textures ');
	}

	map_texture.needsUpdate = true;

} //onDocumentKeyDown

// helper functions from https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
function longitude2tile(lon,zoom) {
	return (Math.floor((lon+180)/360*Math.pow(2,zoom)));
}

function latitude2tile(lat,zoom)  {
	return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom)));
}

function tile2longitude(x,z) {
	return (x/Math.pow(2,z)*360-180);
}

function tile2latitude(y,z) {
	var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
	return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

function longitude2norm(lon) {
	return ((lon+180)/360);
}

function latitude2norm(lat)  {
	return ((1 - Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180)) / Math.PI)/2);
}
