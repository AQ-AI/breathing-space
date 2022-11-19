mapboxgl.accessToken =
"pk.eyJ1IjoieXljbGlhbmciLCJhIjoiY2w5d3Y5aGtkMDQzaDNucWtncnpuN21sMSJ9.Mb6lmVCXVSXGDXJLRlD2AQ";
const geocodeMap = new mapboxgl.Map({
  container: "geocodeMap", // Container ID
  style: "mapbox://styles/yycliang/cl9wvsusl000a14mj99msp21h", // Map style to use
  center: [-71.09561, 42.3638], // Starting position [lng, lat]
  zoom: 12, // Starting zoom level
  projection: "globe",
});
 
// stylize the globe effect
geocodeMap.on("style.load", () => {
    geocodeMap.setFog({
    range: [1, 7],
    color: "#d6fffc",
    "horizon-blend": 0.03,
    "high-color": "#000000",
    "space-color": "#000000",
    "star-intensity": 0,
  });
});

// limit the search engine boundary extent to greater Boston
const bostonBounds = [-71.191247, 42.227911, -70.648072, 42.450118];

// Initialize the geocoder aka the search engine
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  placeholder: "Search Boston", //placeholder text for the search bar
  bbox: bostonBounds, //limit search results to Philadelphia bounds
});
 
// Add the geocoder to the map
map.addControl(geocoder);

//ENTER YOUR JOTFORM API KEY HERE
JF.initialize({ apiKey: "e83551f0a2681795a8e8ae7d06535735" });
 
// Create a function to access the jotform submissions . Format: (formID, callback)
function getSubmissions() {
// ENTER YOUR NEW FORM SUBMISSION ID HERE
  JF.getFormSubmissions("223193774186060", function (responses) {
    console.log(responses)
  });
}
 
// immediately call the function to get the submissions
getSubmissions();

map.on("load", () => {
  console.log(map.getStyle());
});

// instantiate a popup for the basemap
const basemapPopup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});

// create a map.on mouse move event for “land-use” layers
map.on("mousemove", "landuse", (e) => {
  console.log(e.features[0].properties.class);
  basemapPopup
    .setLngLat(e.lngLat)
    .setHTML(`${e.features[0].properties.class}`)
    .addTo(map);
});

map.on("mouseleave", "landuse", () => {
  basemapPopup.remove();
});

