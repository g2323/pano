import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';

class MapState {
	constructor(imageIndex, width, height, zoomLevel, canvasId, tilesServiceUrl, centerLatitude, centerLongitude, centerViewX, centerViewY) {
		this.imageIndex = imageIndex;
		this.width = width;
		this.height = height;
		this.zoomLevel = zoomLevel;
		this.canvasId = canvasId;
		this.tilesServiceUrl = tilesServiceUrl;
		this.centerLatitude = centerLatitude;
		this.centerLongitude = centerLongitude
		this.centerViewX = centerViewX;
		this.centerViewY = centerViewY;
		this.window = null;
		this.window_HiRes = null;

		this.canvas = document.createElement( 'canvas' );
		this.canvas.setAttribute('width', this.width);
		this.canvas.setAttribute('height', this.height);
		this.canvas.setAttribute('id', this.canvasId);
		this.context2d = this.canvas.getContext( '2d' );
		this.map_texture = new THREE.CanvasTexture(this.context2d.canvas);

		this.canvasTPR = 25;
		this.canvasTPC = 8;
		this.zoomLevelHiRes = 16;
		this.canvas_HiRes = document.createElement( 'canvas' );
		this.canvas_HiRes.setAttribute('width', this.canvasTPR * 256);
		this.canvas_HiRes.setAttribute('height', this.canvasTPC * 256);
		this.canvas_HiRes.setAttribute('id', 'offscreen_map_canvas_HiRes');
		this.context2d_HiRes = this.canvas_HiRes.getContext( '2d' );
		this.map_texture_HiRes = new THREE.CanvasTexture(this.context2d_HiRes.canvas);

		this.canvas_CCTV = document.createElement( 'canvas' );
		this.canvas_CCTV.setAttribute('width', 640);
		this.canvas_CCTV.setAttribute('height', 480);
		this.canvas_CCTV.setAttribute('id', 'offscreen_cctv_canvas');
		this.context2d_CCTV = this.canvas_CCTV.getContext( '2d' );
		this.map_texture_CCTV = new THREE.CanvasTexture(this.context2d_CCTV.canvas);
	}

	offscreenMapCanvas() {
		return this.canvas;
	}

	offscreenMapCanvasHiRes() {
		return this.canvas_HiRes;
	}

	offscreenCanvasCCTV() {
		return this.canvas_CCTV;
	}

	dynamicMapTexture() {
		return this.map_texture;
	}

	dynamicMapTextureHiRes() {
		return this.map_texture_HiRes;
	}

	dynamicMapTextureCCTV() {
		return this.map_texture_CCTV;
	}

} // class MapState

// static element
export const appMapState = (function() {
	console.log( 'Create global map state.' );
	// Köln: 50/57/28 N 7/2/40 O
	// Lat 50.957689 (Y) - Long:7.044405 (X)
	const sharedMapState = new MapState(0, 512, 512, 12, 'offscreen_map_canvas', 'http://map.psi.de/tiles/', 50.957689, 7.044405, 0.5, 0.5);

	return function() {
		return sharedMapState;
	};
})();
