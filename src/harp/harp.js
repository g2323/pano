var here_apikey = null;

loadConfiguration('../assets/configuration/apikeys.json')
.then((keys) => {
  here_apikey = keys.here;
  console.log(here_apikey);
})
.then(() => createMap())
.catch((message) => {
  console.log(message);
});

function createMap() {
  const map = new harp.MapView({
    canvas: document.getElementById("map"),
    theme:
    "https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_night_reduced.json",
    //target: new harp.GeoCoordinates(37.773972, -122.431297), //San Francisco,
    //target: new harp.GeoCoordinates(50.957689, 7.044405), // Köln
    //target: new harp.GeoCoordinates(51.5037212, 7.4943671), // Dortmund
    target: new harp.GeoCoordinates(52.5236049, 13.4057996), // PSI Berlin
    zoomLevel: 13
  });
  const controls = new harp.MapControls(map);

  window.onresize = () => map.resize(window.innerWidth, window.innerHeight);

  const omvDataSource = new harp.OmvDataSource({
    baseUrl: "https://vector.hereapi.com/v2/vectortiles/base/mc",
    apiFormat: harp.APIFormat.XYZOMV,
    styleSetName: "tilezen",
    authenticationCode: here_apikey,
    authenticationMethod: {
      method: harp.AuthenticationMethod.QueryString,
      name: "apikey"
    }
  });
  map.addDataSource(omvDataSource);
}


function loadConfiguration(url) {
  return fetch(url)
  .then(response => response.json())
  .catch((message) => {
    console.log(message);
  });
}
