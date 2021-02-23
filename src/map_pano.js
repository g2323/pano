import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';

import { getAppState } from './app_state.js';
import * as MAP from './map_state.js';
import * as MAPUTIL from './map_util.js';

export function addMeshToScene(scene) {

	loadTextures(true);  // false

	const map_geometry = new THREE.CylinderBufferGeometry(512, 512, 1024, 64, 1, true, 0.0, 2 * Math.PI );
	map_geometry.scale( - 1, 1, 1 );
	const map_texture = getAppState().dynamicMapTextureHiRes();
	const map_material = new THREE.MeshBasicMaterial( { map: map_texture } );
	//map_texture.needsUpdate = true; // ???
	//map_material.needsUpdate = true; // ???
	const map_mesh = new THREE.Mesh( map_geometry, map_material );
	map_mesh.position.y = 0.0;
	map_mesh.position.z = 0.0;

	scene.add( map_mesh );
	//document.addEventListener("keydown", onDocumentKeyDown, false);

	return map_mesh;
}


function loadTextures(keepScale) {
	//const loader = new THREE.ImageLoader();
	const canvas = getAppState().offscreenMapCanvasHiRes();
	const context2d = canvas.getContext( '2d' );
	const map_texture = getAppState().dynamicMapTextureHiRes();

	var dx = 0.0;
	var dy = 0.0;

	const zoomLevel = MAP.appMapState().zoomLevelHiRes;
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

		const tpr = getAppState().canvasTPR;
		const tpc = getAppState().canvasTPC;

		const maxTiles = Math.pow(2,zoomLevel);

		tile_00x -= (tpr / 2);
		tile_00y -= (tpc / 2);

		if (left) {
			tile_00x--;
		}
		if (upper) {
			tile_00y --;
		}

		if (tile_00x < 0) {
			tile_00x += maxTiles;
		}
		if (tile_00y < 0) {
			tile_00y += maxTiles;
		}

		if (zoomLevel == 1) {
			tile_00x = 0;
			tile_00y = 0;
		}


		const tiles = new Array(tpr);
		for (var x = 0; x < tpr; x++) {
			tiles[x] = new Array(tpc);
			for (var y = 0; y < tpc; y++) {
				const abs_x = (tile_00x + x) % maxTiles;
				const abs_y = (tile_00y + y) % maxTiles;
				tiles[x][y] = abs_x.toFixed(0) + '/'+ abs_y.toFixed(0) + '.png';
			}
		}


		//get relative position
		longMin = MAPUTIL.longitude2norm(MAPUTIL.tile2longitude(tile_00x, zoomLevel));
		longMax = MAPUTIL.longitude2norm(MAPUTIL.tile2longitude(tile_00x + tpr, zoomLevel));
		latMin = MAPUTIL.latitude2norm(MAPUTIL.tile2latitude(tile_00y, zoomLevel));
		latMax = MAPUTIL.latitude2norm(MAPUTIL.tile2latitude(tile_00y + tpc, zoomLevel));
		const cx = 0.5;
		const cy = 0.5;


		if (!MAP.appMapState().window_HiRes) {
			map_texture.repeat.x = 1.0; // 0.5
			map_texture.repeat.y = 1.0; // 0.5

			MAP.appMapState().window_HiRes = {
				longMin : longMin,
				longMax : longMax,
				latMin : latMin,
				latMax : latMax,
				centerViewX : cx,
				centerViewY : cy
			};
		} else {
			MAP.appMapState().window_HiRes.longMin = longMin;
			MAP.appMapState().window_HiRes.longMax = longMax;
			MAP.appMapState().window_HiRes.latMin = latMin;
			MAP.appMapState().window_HiRes.latMax = latMax;
		}

		dx = ((MAPUTIL.longitude2norm(MAP.appMapState().centerLongitude) - longMin) / (longMax - longMin));
		dy = ((MAPUTIL.latitude2norm(MAP.appMapState().centerLatitude) - latMin) / (latMax - latMin));
		console.log('dy: ' + dy + ' left ' + left + ' upper ' + upper);
		//if (dy < 0.0) { dy += 1.0; };


		function loadImage( url ) {
			return new Promise( resolve => {
				//console.log( 'loading image ');
				new THREE.ImageLoader().load(url, resolve );
			})
		}

		const promises = [];
		for (var x = 0; x < tiles.length; x++) {
			for (var y = 0; y < tiles[x].length; y++) {
				const offset_x = x * 256;
				const offset_y = y * 256;
				promises.push(loadImage(url + '' + zoomLevel + '/' + tiles[x][y]).then(image => { textureOnLoad(image, offset_x, offset_y, 256, 256); } ));
			}
		}

		Promise.all(promises).then(() => {
			//console.log( 'habe alles geladen ');
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
		//console.log( `textureOnLoad: ${x}, ${y}, ${w}, ${h}`);
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


function drawPanoCoordinates(context2d) {
	getAppState().panoList.forEach((item, index) => {
		const longMin = MAP.appMapState().window_HiRes.longMin;
		const longMax = MAP.appMapState().window_HiRes.longMax;
		const latMin = MAP.appMapState().window_HiRes.latMin;
		const latMax = MAP.appMapState().window_HiRes.latMax;

		const dx = ((MAPUTIL.longitude2norm(item.longitude) - longMin) / (longMax - longMin));
		const dy = ((MAPUTIL.latitude2norm(item.latitude) - latMin) / (latMax - latMin));

		context2d.beginPath();
		context2d.arc((dx) * 512, (dy) * 512, 3, 0, 2 * Math.PI);
		context2d.fill();
	});
}
