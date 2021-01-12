import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import * as EXIFR from '../js/exifr/dist/lite.esm.js';
import * as MAP from './map_state.js';

const panoList = [
	{
		url : './assets/textures/PANO_001.jpeg',
		type : 'cylinder2D',
		haov : 180.0
	},
	{
		//url : 'http://www.g2323.de/g2323/Willkommen.html',
		url : 'https://www.psi.de/de/home/',
		type : 'iframe_overlay' // this comes
	},
	{
		url : './assets/world/Koffer1.glb',
		type : 'Object-3D'
	},
	{
		url : './assets/video/cctv.mp4',
		type : 'Video-2D'
	},
	{
		url : './assets/video/HET_0027_360-2D.mp4',
		type : 'Video-360-2D'
	},
	{
		url : '192.168.2.38',
		type : 'Video2D_Stream_Axis',
		encoding : 'h264'
	},
	// {
	// 	url : './assets/textures/IMG_0352.jpeg',
	// 	type : 'cylinder2D',
	// 	haov : 240.0
	// },
	// {
	// 	url : './assets/textures/IMG_0410.jpeg',
	// 	type : 'cylinder2D',
	// 	haov : 180
	// },
	//
	// {
	// 	url : './assets/textures/IMG_0430.jpeg',
	// 	type : 'cylinder2D',
	// 	haov : 180.0
	// },
	// {
	// 	url : './assets/textures/IMG_0440.jpeg',
	// 	type : 'cylinder2D',
	// 	haov : 180.0
	// },
	// {
	// 	url : './assets/textures/HET_0007_render.jpg',
	// 	type : 'sphere360'
	// },
	// {
	// 	url : './assets/textures/HET_0016_render.jpg',
	// 	type : 'sphere360'
	// },
	// {
	// 	url : './assets/textures/HET_0026_render.jpg',
	// 	type : 'sphere360'
	// },
	{
		url : './assets/textures/HET_0031_render.jpg',
		type : 'sphere360'
	},
	// {
	// 	url : './assets/textures/Amrum.jpg',
	// 	type : 'cylinder2D',
	// 	haov : 240.0
	// },
	{
		url : './assets/textures/Feld.jpg',
		type : 'sphere360',
		radius : 512,
		position_y : -256
	},
	// {
	// 	url : './assets/textures/Föhr.jpg',
	// 	type : 'cylinder2D',
	// 	haov : 240.0
	// },
	// {
	// 	url : './assets/textures/Schlagbaum.jpg',
	// 	type : 'cylinder2D',
	// 	haov : 358.0
	// },
	{
		url : 'https://www.psilogistics.com/de/home/',
		//url : 'http://www.g2323.de/g2323/Willkommen.html',
		//url : 'https://www.psi.de/de/home/',
		type : 'url' // this comes
	}
];

//var index = MAP.appMapState().imageIndex;
//index++;
//index%= panoList.length;

export function getPanoConfiguration(index) {
	if (index < 0) {
		index = 0;
	}
	if (index > panoList.length - 1) {
		index = panoList.length - 1;
	}
	return panoList[index];
}

export function getSelectedPanoConfiguration() {
	return getPanoConfiguration(MAP.appMapState().imageIndex);
}

export function getNextPanoConfiguration() {
	var index = MAP.appMapState().imageIndex;
	index++;
	index%= getPanoListSize();
	return getPanoConfiguration(index);
}

export function selectNextPanoConfiguration() {
	var index = MAP.appMapState().imageIndex;
	index++;
	index%= getPanoListSize();
	MAP.appMapState().imageIndex = index;
	console.log('next image ' + index);
	return getPanoConfiguration(index);
}

export function getPanoListSize() {
	return panoList.length;
}


export function parseImages() {
	panoList.forEach(parseImage);
	MAP.appMapState().panoList = panoList;
}

function parseImage(item, index) {
	// EXIFR.gps(item.url)
	// .then(output => {
	// 	//console.log(item.url + ' ' + output.latitude + ' ' + output.longitude);
	// 	item.latitude = output.latitude;
	// 	item.longitude = output.longitude;
	// 	console.log(item);
	// });
	EXIFR.parse(item.url)
	.then(output => {
		console.log(item.url);
		console.log(output);

		item.latitude = output.latitude;
		item.longitude = output.longitude;

		const w = output.ExifImageWidth;
		const h = output.ExifImageHeight;
		// rough estimation for ccd chip size - may vary between camera models...
		const ccd_pixel_size = 0.001; // camera specific 0...14
		const ccd_h = h * ccd_pixel_size;
		const f = output.FocalLength;
		const vaov = 2.0 * Math.atan(ccd_h / ( 2.0 * f)) * (180.0 / Math.PI);
		const haov = vaov * (w / h);
		const verticalSize = 2.0 * 512 * Math.tan(vaov / 360.0 * Math.PI);
		console.log('VAOV: ' + vaov + ' HAOV: ' + haov + ' VerticalSize: ' + verticalSize);

		item.vaov = vaov;
		item.haov = haov;
		item.verticalSize = verticalSize;
	});
}
