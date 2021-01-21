import * as THREE from '../js/three/build/three.module.js';
import { MathUtils } from '../js/three/src/math/MathUtils.js';
import * as EXIFR from '../js/exifr/dist/lite.esm.js';
import * as MAP from './map_state.js';

var panoList = null;

export function init() {
	return loadConfiguration('./assets/configuration/pano.json')
	.then(panoList => setPanoList(panoList))
	.then(panoList => parseImages(panoList))
	.catch((message) => {
		console.log(message);
	});
}


function loadConfiguration(url) {
	return fetch(url)
	.then(response => response.json())
	.catch((message) => {
		console.log(message);
	});
}

function setPanoList(list) {
	return new Promise((resolve, reject) => {
		panoList = list;
		MAP.appMapState().panoList = panoList;
		resolve(list); // returns the list
	});
}

function getPanoList() {
	return panoList;
}



//var index = MAP.appMapState().imageIndex;
//index++;
//index%= panoList.length;

export function getPanoConfiguration(index) {
	if (index < 0) {
		index = 0;
	}
	const list = getPanoList();
	if (index > list.length - 1) {
		index = list.length - 1;
	}
	return list[index];
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

function getPanoListSize() {
	const list = getPanoList();
	return list.length;
}


function parseImages(panoList) {
	panoList.forEach(parseImage);

}

function parseImage(item, index) {
	if (item.type == 'cylinder2D' ||
	item.type == 'sphere360') {
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
			if (output) {
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
			}
		}).catch((message) => {
			console.log(item.url + ': ' + message);
		});
	}
}
