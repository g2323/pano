import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import { getAppState } from './app_state.js';
import * as MAP from './map_state.js';
import * as MAPUTIL from './map_util.js';

export function addMeshToScene(scene) {

	//map plane
	const map_control_geometry = new THREE.BoxBufferGeometry( 40.0, 100.0, 5.0 );
	const map_control_material = new THREE.MeshBasicMaterial( { color: 0x333333 } );
	const map_control_mesh = new THREE.Mesh( map_control_geometry, map_control_material );

	loadTextures(false);

	const map_geometry = new THREE.PlaneGeometry( 32.0, 32.0);
	const map_texture = getAppState().dynamicMapTexture();
	const map_material = new THREE.MeshBasicMaterial( { map: map_texture } );
	//map_texture.needsUpdate = true; // ???
	//map_material.needsUpdate = true; // ???
	const map_mesh = new THREE.Mesh( map_geometry, map_material );
	map_mesh.position.y = 30.0;
	map_mesh.position.z = 2.6;

	const map_group = new THREE.Group();
	map_group.add( map_control_mesh );
	map_group.add( map_mesh );
	map_group.position.y = -100.0;
	map_group.position.z = -256.0; // -0.1;
	map_group.receiveShadow = true; //default is false

	scene.add( map_group );
	document.addEventListener("keydown", onDocumentKeyDown, false);

	return map_group;
}


function loadTextures(keepScale) {
	//const loader = new THREE.ImageLoader();
	const canvas = getAppState().offscreenMapCanvas();
	const context2d = canvas.getContext( '2d' );
	const map_texture = getAppState().dynamicMapTexture();

	var dx = 0.0;
	var dy = 0.0;

	const zoomLevel = MAP.appMapState().zoomLevel;
	const url = MAP.appMapState().tilesServiceUrl;

	//console.log( 'loadTextures ' + zoomLevel + ' from ' + url);
	// tiles are 256x256, web mercator

	if (zoomLevel == 0) {
		//const image0 = loader.load(url + '' + zoomLevel + '/0/0.png', function ( image ) { textureOnLoad(image, 128, 128, 256, 256, 0, 0); } );

	} else if (zoomLevel > 0) {

		// load a image resource
		//    00 10
		//    01 11

		var tile_00x =  MAPUTIL.longitude2tile(MAP.appMapState().centerLongitude, zoomLevel);
		var tile_00y =  MAPUTIL.latitude2tile(MAP.appMapState().centerLatitude, zoomLevel);

		// in welchem Quadranten der ersten Tile sind wir gelandet?
		var longMin = MAPUTIL.longitude2norm(MAPUTIL.tile2longitude(tile_00x, zoomLevel));
		var longMax = MAPUTIL.longitude2norm(MAPUTIL.tile2longitude(tile_00x + 1, zoomLevel));
		var latMin = MAPUTIL.latitude2norm(MAPUTIL.tile2latitude(tile_00y, zoomLevel));
		var latMax = MAPUTIL.latitude2norm(MAPUTIL.tile2latitude(tile_00y + 1, zoomLevel));
		//TODO: erst projezieren...
		const left = (MAPUTIL.longitude2norm(MAP.appMapState().centerLongitude) <= ((longMin + longMax)/2.0))? true : false;
		const upper = (MAPUTIL.latitude2norm(MAP.appMapState().centerLatitude) <= ((latMin + latMax)/2.0))? true : false;

		if (left && tile_00x > 0) {
			tile_00x -= 1.0;
		}
		if (upper && tile_00y > 0) {
			tile_00y -= 1.0;
		}
		if (zoomLevel == 1) {
			tile_00x = 0;
			tile_00y = 0;
		}

		const tile_00 = tile_00x.toFixed(0) + '/'+ tile_00y.toFixed(0) + '.png';
		const tile_10 = (tile_00x + 1).toFixed(0) + '/'+ tile_00y.toFixed(0) + '.png';
		const tile_01 = tile_00x.toFixed(0) + '/'+ (tile_00y + 1).toFixed(0) + '.png';
		const tile_11 = (tile_00x + 1).toFixed(0) + '/'+ (tile_00y + 1).toFixed(0) + '.png';

		//get relative position
		longMin = MAPUTIL.longitude2norm(MAPUTIL.tile2longitude(tile_00x, zoomLevel));
		longMax = MAPUTIL.longitude2norm(MAPUTIL.tile2longitude(tile_00x + 2, zoomLevel));
		latMin = MAPUTIL.latitude2norm(MAPUTIL.tile2latitude(tile_00y, zoomLevel));
		latMax = MAPUTIL.latitude2norm(MAPUTIL.tile2latitude(tile_00y + 2, zoomLevel));
		const cx = 0.5;
		const cy = 0.5;


		if (!MAP.appMapState().window) {
			map_texture.repeat.x = 0.5;
			map_texture.repeat.y = 0.5;

			MAP.appMapState().window = {
				longMin : longMin,
				longMax : longMax,
				latMin : latMin,
				latMax : latMax,
				centerViewX : cx,
				centerViewY : cy
			};
		} else {
			MAP.appMapState().window.longMin = longMin;
			MAP.appMapState().window.longMax = longMax;
			MAP.appMapState().window.latMin = latMin;
			MAP.appMapState().window.latMax = latMax;
		}

		dx = ((MAPUTIL.longitude2norm(MAP.appMapState().centerLongitude) - longMin) / (longMax - longMin));
		dy = ((MAPUTIL.latitude2norm(MAP.appMapState().centerLatitude) - latMin) / (latMax - latMin));
		//console.log('dy: ' + dy + ' left ' + left + ' upper ' + upper);
		//if (dy < 0.0) { dy += 1.0; };


		function loadImage( url ) {
			return new Promise( resolve => {
				//console.log( 'loading image ');
				new THREE.ImageLoader().load(url, resolve );
			})
		}

		const promises = [
			loadImage(url + '' + zoomLevel + '/' + tile_00).then(image => { textureOnLoad(image, 0, 0, 256, 256); } ),
			loadImage(url + '' + zoomLevel + '/' + tile_10).then(image => { textureOnLoad(image, 256, 0, 256, 256); } ),
			loadImage(url + '' + zoomLevel + '/' + tile_01).then(image => { textureOnLoad(image, 0, 256, 256, 256); } ),
			loadImage(url + '' + zoomLevel + '/' + tile_11).then(image => { textureOnLoad(image, 256, 256, 256, 256); } )
		];

		Promise.all(promises).then(() => {
			console.log( 'habe alles geladen ');
			// context2d.beginPath();
			// context2d.arc((dx) * 512, (dy) * 512, 5, 0, 2 * Math.PI);
			// context2d.fill();

			drawPanoCoordinates(context2d);

			if (!keepScale) {
				if (map_texture.repeat.x > 0.5) { map_texture.repeat.x /= 2.0 }
				else if (map_texture.repeat.x < 0.25) { map_texture.repeat.x *= 2.0 };
				if (map_texture.repeat.y > 0.5) { map_texture.repeat.y /= 2.0 }
				else if (map_texture.repeat.y < 0.25) { map_texture.repeat.y *= 2.0 };
			}

			map_texture.offset.x = ((dx - cx) / 1.0) + ((1.0 - map_texture.repeat.x) / 2.0);
			map_texture.offset.y = ((cy - dy) / 1.0) + ((1.0 - map_texture.repeat.y) / 2.0);  // texture origin is bottom left, canvas is top left

			map_texture.needsUpdate = true;
		});

	};

	function textureOnLoad ( image, x, y, w, h ) {
		//console.log( 'textureOnLoad ');
		//const map_texture = dynamicMapTexture();
		context2d.drawImage( image, x, y, w, h );

		// if (!keepScale) {
		// 	if (map_texture.repeat.x > 0.5) { map_texture.repeat.x /= 2.0 }
		// 	else if (map_texture.repeat.x < 0.25) { map_texture.repeat.x *= 2.0 };
		// 	if (map_texture.repeat.y > 0.5) { map_texture.repeat.y /= 2.0 }
		// 	else if (map_texture.repeat.y < 0.25) { map_texture.repeat.y *= 2.0 };
		// }
		// map_texture.offset.x = dx + ((1.0 - map_texture.repeat.x) / 2.0);
		// map_texture.offset.y = dy + ((1.0 - map_texture.repeat.y) / 2.0);
		//
		// map_texture.needsUpdate = true;
	}
}

function onDocumentKeyDown(event) {
	var key = event.key;
	const map_texture = getAppState().dynamicMapTexture();
	const zoomLevel = MAP.appMapState().zoomLevel;
	const panStep = 5.0 / Math.pow(2, zoomLevel);
	var needsReloadTextures = false;
	var keepScale = true;

	if (key == 'i') {
		// zoom in
		if (map_texture.repeat.x >= 0.25) map_texture.repeat.x /=  1.05;
		if (map_texture.repeat.y >= 0.25) map_texture.repeat.y /=  1.05;

		//console.log('repeat.x ' + map_texture.repeat.x + ' offset.x ' + map_texture.offset.x)
		//console.log('repeat.y ' + map_texture.repeat.y + ' offset.y ' + map_texture.offset.y)
	} else if (key == 'o') {
		// zoom out
		if (map_texture.repeat.x <= 0.5) map_texture.repeat.x *= 1.05;
		if (map_texture.repeat.y <= 0.5) map_texture.repeat.y *= 1.05;

		//console.log('repeat.x ' + map_texture.repeat.x + ' offset.x ' + map_texture.offset.x)
		//console.log('repeat.y ' + map_texture.repeat.y + ' offset.y ' + map_texture.offset.y)
	} else if (key == 'h') {
		// pan left
		//console.log(map_texture.offset.x);
		if (MAP.appMapState().centerLongitude < (180.0 - (35 * panStep))) { MAP.appMapState().centerLongitude += panStep };
	} else if (key == 'j') {
		// pan right
		if (MAP.appMapState().centerLongitude > (-180.0 + (35 * panStep))) { MAP.appMapState().centerLongitude -= panStep };
	} else if (key == 'u') {
		// pan up
		if (MAP.appMapState().centerLatitude > (-85.0 + (25 * panStep))) { MAP.appMapState().centerLatitude -= panStep };
	} else if (key == 'n') {
		// pan down
		if (MAP.appMapState().centerLatitude < (85.0 - (25 * panStep))) {MAP.appMapState().centerLatitude += panStep };
	}

	const longMin = MAP.appMapState().window.longMin;
	const longMax = MAP.appMapState().window.longMax;
	const latMin = MAP.appMapState().window.latMin;
	const latMax = MAP.appMapState().window.latMax;
	const cx = MAP.appMapState().window.centerViewX;
	const cy = MAP.appMapState().window.centerViewY;

	const dx = ((MAPUTIL.longitude2norm(MAP.appMapState().centerLongitude) - longMin) / (longMax - longMin));
	const dy = ((MAPUTIL.latitude2norm(MAP.appMapState().centerLatitude) - latMin) / (latMax - latMin));

	map_texture.offset.x = ((dx - cx) / 1.0) + ((1.0 - map_texture.repeat.x) / 2.0);
	map_texture.offset.y = ((cy - dy) / 1.0) + ((1.0 - map_texture.repeat.y) / 2.0);  // texture origin is bottom left, canvas is top left

	if (map_texture.offset.x < 0.0) {
		// load left, value is percentage uo vieport start
		//console.log( 'load left: offset ' + map_texture.offset.x + ' scale ' + map_texture.repeat.x );
		needsReloadTextures = true;
	} else if (map_texture.offset.x > (1.0 - map_texture.repeat.x)) {
		// rechts nachladen
		//console.log( 'load right: offset ' + map_texture.offset.x + ' scale ' + map_texture.repeat.x );
		needsReloadTextures = true;
	}

	if (map_texture.offset.y < 0.0) {
		// load bottom
		//console.log( 'load bottom: offset ' + map_texture.offset.y + ' scale ' + map_texture.repeat.y );
		needsReloadTextures = true;
	} if (map_texture.offset.y > (1.0 - map_texture.repeat.y)) {
		// load top
		//console.log( 'load top: offset ' + map_texture.offset.y + ' scale ' + map_texture.repeat.y );
		needsReloadTextures = true;
	}


	// so was in der Richtung
	if (map_texture.repeat.x < 0.25 && MAP.appMapState().zoomLevel < 18) {
		MAP.appMapState().zoomLevel++;
		keepScale = false;
		needsReloadTextures = true;
		//console.log( 'update Textures ');
	} else if (map_texture.repeat.x > 0.5 && MAP.appMapState().zoomLevel > 1) {   //0.55
		MAP.appMapState().zoomLevel--;
		keepScale = false;
		needsReloadTextures = true;
		//console.log( 'update Textures ');
	}

	if (needsReloadTextures) {
		loadTextures(keepScale);
	}

	map_texture.needsUpdate = true;

} //onDocumentKeyDown

function drawPanoCoordinates(context2d) {
	getAppState().panoList.forEach((item, index) => {
		const longMin = MAP.appMapState().window.longMin;
		const longMax = MAP.appMapState().window.longMax;
		const latMin = MAP.appMapState().window.latMin;
		const latMax = MAP.appMapState().window.latMax;

		const dx = ((MAPUTIL.longitude2norm(item.longitude) - longMin) / (longMax - longMin));
		const dy = ((MAPUTIL.latitude2norm(item.latitude) - latMin) / (latMax - latMin));

		context2d.beginPath();
		context2d.arc((dx) * 512, (dy) * 512, 3, 0, 2 * Math.PI);
		context2d.fill();
	});
}
