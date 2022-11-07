
const air = "json/air_pollution.geojson";
function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}
function flyToClick(coords) {
  deckgl.setProps({
    initialViewState: {
      longitude: coords[0],
      latitude: coords[1],
      zoom: 15,
      transitionDuration: 500,
      transitionInterpolator: new deck.FlyToInterpolator(),
    },
  });
}

const panel = document.getElementById("panel");
const panelChild = document.querySelector("#panel :nth-child(2)");

const deckgl = new deck.DeckGL({
  container: "map",
  // Set your Mapbox access token here
  mapboxApiAccessToken:
    "pk.eyJ1IjoieXljbGlhbmciLCJhIjoiY2w5d3Y5aGtkMDQzaDNucWtncnpuN21sMSJ9.Mb6lmVCXVSXGDXJLRlD2AQ",
  // Set your Mapbox style here
  mapStyle: "mapbox://styles/yycliang/cl9wvsusl000a14mj99msp21h",
  initialViewState: {
    latitude: 39.9526,
    longitude: -75.1652,
    zoom: 12,
    bearing: 0,
    pitch: 0,
  },
  controller: true,

  layers: [
    new deck.GeoJsonLayer({
      id: "air",
      data: air,
      // Styles
      filled: true,
      stroke: false,
      // Function for fill color
      getFillColor: (d) => {
        const abs = Math.abs(d.properties.PM25_UG_M3);
        const color = map_range(abs, 0, 3.5, 0, 255); //lazy remap values to 0-255
        //logic:
        //If HSI_SCORE isn’t null:
        //if less than 0, return something in a blue-hue, otherwise red hue
        //if HSI_Score is null, return color with 0 alpha (transparent)
        return d.properties.PM25_UG_M3
          ? d.properties.PM25_UG_M3 < 0
            ? [60, 60, color, 0]
            : [color, 60, 72, color + 66]
          : [0, 0, 0, 0];
      },
      getStrokeColor: [0, 0, 0, 255],
      LineWidthUnits: "meters",
      getLineWidth: 35,
      // Interactive props
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 200],
      onClick: (info) => {
        flyToClick(info.coordinate);

        panelChild.innerHTML = `<strong>Site address #${info.object.properties.SITE_ADDRESS
          }</strong>
            <br></br>
            PM2.5 concentrations: ${info.object.properties.PM25_UG_M3.toFixed(
            2 || "N/A"
          )} <br></br>
            S02 Concentrations: ${info.object.properties.SAMPLE_TIMESTAMP.toFixed(2 || "N/A")}
            <br></br>
            NO2 Concentrations: ${info.object.properties.SAMPLE_TIMESTAMP.toFixed(2 || "N/A")}
            <br></br>
            Coordinates:
            ${info.coordinate[0].toFixed(3)},
            ${info.coordinate[1].toFixed(3)}`;
        panel.style.opacity = 1;
      },
    }),
  ],
  getTooltip: ({ object }) => {
    return (
      object &&
      `PM2.5 concentration: ${object.properties.PM25_UG_M3
        ? object.properties.PM25_UG_M3.toFixed(2)
        : "No Data"
      }`
    );
  },
});

