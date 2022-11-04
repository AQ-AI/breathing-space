// ADD YOUR MAPBOX ACCESS TOKEN
mapboxgl.accessToken = "pk.eyJ1IjoieXljbGlhbmciLCJhIjoiY2w5d3Y5aGtkMDQzaDNucWtncnpuN21sMSJ9.Mb6lmVCXVSXGDXJLRlD2AQ"; //YOUR KEY HERE
 
// CREATE A NEW OBJECT CALLED MAP
const map = new mapboxgl.Map({
  container: "map", // container ID for the map object (this points to the HTML element)
  style: "mapbox://styles/yycliang/cl9wvsusl000a14mj99msp21h", //YOUR STYLE URL
  center: [-75.1652, 39.9526], // starting position [lng, lat]
  zoom: 12, // starting zoom
  projection: "globe", // display the map as a 3D globe
});
