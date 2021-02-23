// import * as THREE from '../js/three/build/three.module.js';
// //import { MathUtils } from '../js/three/src/math/MathUtils.js';
//
// //import * as HARP from '../js/harp.gl/harp.js';
//
// //import * as MANAGER from './pano_manager.js';
//
//
//
// export function addMeshToScene(scene) {
//
// const map = new harp.MapView({
//     canvas: document.getElementById( 'map' ),
//     theme:
//         "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_night_reduced.json",
//     target: new harp.GeoCoordinates(37.773972, -122.431297), //San Francisco,
//     zoomLevel: 13
// });
// const controls = new harp.MapControls(map);
//
// window.onresize = () => map.resize(window.innerWidth, window.innerHeight);
//
// const omvDataSource = new harp.OmvDataSource({
//     baseUrl: "https://vector.hereapi.com/v2/vectortiles/base/mc",
//     apiFormat: harp.APIFormat.XYZOMV,
//     styleSetName: "tilezen",
//     authenticationCode: "YOUR-APIKEY",
//     authenticationMethod: {
//         method: harp.AuthenticationMethod.QueryString,
//         name: "apikey"
//     }
// });
// map.addDataSource(omvDataSource);
//
// }
