import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';

class MapState {
	constructor(width, height, zoomLevel, canvasId, tilesServiceUrl, centerLatitude, centerLongitude, centerViewX, centerViewY, dx, dy) {
		this.width = width;
		this.height = height;
		this.zoomLevel = zoomLevel;
		this.canvasId = canvasId;
		this.tilesServiceUrl = tilesServiceUrl;
		this.centerLatitude = centerLatitude;
		this.centerLongitude = centerLongitude
		this.centerViewX = centerViewX;
		this.centerViewY = centerViewY;
		this.dx = dx;
		this.dy = dy;

		this.canvas = document.createElement( 'canvas' );
		this.canvas.setAttribute('width', this.width);
		this.canvas.setAttribute('height', this.height);
		this.canvas.setAttribute('id', this.canvasId);
		this.context2d = this.canvas.getContext( '2d' );
		this.map_texture = new THREE.CanvasTexture(this.context2d.canvas);
	}

	offscreenMapCanvas() {
		return this.canvas;
	}

	dynamicMapTexture() {
		return this.map_texture;
	}

} // class MapState

// static element
export const appMapState = (function() {
	console.log( 'Create global map state.' );
	// Köln: 50/57/28 N 7/2/40 O
	// Lat 50.957689 (Y) - Long:7.044405 (X)
	const sharedMapState = new MapState(512, 512, 12, 'offscreen_map_canvas', 'http://map.psi.de/tiles/', 50.957689, 7.044405, 0.5, 0.5, 0.0, 0.0);

	return function() {
		return sharedMapState;
	};
})();
