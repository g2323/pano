import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';

class AppState {
	constructor() {
		this.imageIndex = 0;

		this.canvas = document.createElement( 'canvas' );
		this.canvas.setAttribute('width', 512);
		this.canvas.setAttribute('height', 512);
		this.canvas.setAttribute('id', 'offscreen_map_canvas');
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

		this.canvas_MediaCapture = document.createElement( 'canvas' );
		this.canvas_MediaCapture.setAttribute('width', 640);
		this.canvas_MediaCapture.setAttribute('height', 480);
		this.canvas_MediaCapture.setAttribute('id', 'offscreen_media_capture_canvas');
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

	offscreenCanvasMediaCapture() {
		return this.canvas_MediaCapture;
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
export const getAppState = (function() {
	console.log( 'Create global app state.' );

	const sharedAppState = new AppState();

	return function() {
		return sharedAppState;
	};
})();
