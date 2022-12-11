mapboxgl.accessToken = "pk.eyJ1IjoiYWlycG9sbHBoaWxseSIsImEiOiJjbGF3dXRqcTIwamNuM3dwa3JuamdyNGxoIn0.vcsXDKW-TC66e4VpuX1pJA";
const map = new mapboxgl.Map({
    container: "map", // Container ID
    style: "mapbox://styles/airpollphilly/clawv4g4p000014lgrz9qaljy", // Map style to use
    center: [-75.1652, 39.9526], // center on philadelphia
    zoom: 12, // Starting zoom level
    projection: "globe",
});

// stylize the globe effect
map.on("style.load", () => {
    map.setFog({
        range: [1, 7],
        color: "#d6fffc",
        "horizon-blend": 0.03,
        "high-color": "#000000",
        "space-color": "#000000",
        "star-intensity": 0,
    });
});

// limit the search engine boundary extent to the center of philadelphia
const phillyBounds = [-75.295626, 39.865930, -74.966036, 40.046464];

// Initialize the geocoder aka the search engine
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken, // Set the access token
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    placeholder: "Search Philly", //placeholer text for the search bar
    bbox: phillyBounds, //limit search results to Philadelphia bounds
});

// Add the geocoder to the map
map.addControl(geocoder);

JF.initialize({ apiKey: "e83551f0a2681795a8e8ae7d06535735" });

//ENTER YOUR JOTFORM API KEY HERE

JF.getFormSubmissions("223104390365146", function (response) {
    console.log(response);
    // array to store all the submissions: we will use this to create the map
    const incidents = [];
    // for each response
    for (var i = 0; i < response.length; i++) {
        const incidentProps = {};
        // add all fields of response.answers to our object
        const keys = Object.keys(response[i].answers);
        keys.forEach((answer) => {
            const lookup = response[i].answers[answer].cfname ? "cfname" : "name";
            incidentProps[response[i].answers[answer][lookup]] =
                response[i].answers[answer].answer;
        });

        incidentProps["Location Coordinates"] = response[i].answers[22].answer.split(/\r?\n/)
            .map((x) => parseFloat(x.replace(/[^\d.-]/g, ""))).slice(0, 2);
        // convert location coordinates string to float array
        console.log(incidentProps)
        // add submission to submissions array
        incidents.push(incidentProps);
    }
    const { MapboxLayer, ScatterplotLayer } = deck;
    const firstLabelLayerId = map
        .getStyle()
        .layers.find((layer) => layer.type === "symbol").id;

    map.addLayer(
        new MapboxLayer({
            id: "deckgl-circle",
            type: ScatterplotLayer,
            data: incidents,
            getPosition: (d) => {
                return d["Location Coordinates"];
            },
            // Styles
            radiusUnits: "pixels",
            getRadius: 5,
            opacity: 0.7,
            stroked: true,
            filled: true,
            radiusScale: 3,
            getFillColor: [252, 186, 3],
            lineWidthMinPixels: 1,
            getLineColor: [0, 0, 0],
            pickable: true,
            autoHighlight: true,
            highlightColor: [255, 255, 255, 255],
            parameters: {
                depthTest: false,
            },
            onClick: (info) => {
                //ADD NEW INPUT TO GETIMAGE GALLERY:
                getImageGallery(info.object.fileUpload, info.object.describeThe);
                flyToClick(info.object["Location Coordinates"]);
            },
        }),
        firstLabelLayerId
    );
    map.addSource("air-data", {
        type: "geojson",
        data: "https://opendata.arcgis.com/datasets/1839b35258604422b0b520cbb668df0d_0.geojson",
    });

    map.addLayer({
        id: "air",
        type: "circle",
        source: "air-data",
        filled: true,
        stroke: false,
        layout: {
            // Make the layer visible by default.
            visibility: "visible",
        },
        paint: {
            "circle-radius": 10,
            "circle-color": "#291e9e",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#000000",
        },
    });
    // Center the map on the coordinates of any clicked circle from the 'circle' layer.
    map.on("click", "air", (e) => {
        // console.log("i get here", e.features[0].geometry.coordinates);
        map.flyTo({
            center: e.features[0].geometry.coordinates,
        });
    });
    function getImageGallery(images, text) {
        const imageGallery = document.createElement("div");
        imageGallery.id = "image-gallery";

        for (var i = 0; i < images.length; i++) {
            const image = document.createElement("img");
            image.src = images[i];
            image.style = "max-width:70%; max-height:70%;";
            image.className += "img-fluid p-3";
            imageGallery.appendChild(image);
        }

        //   add exit button to image gallery
        const exitButton = document.createElement("button");
        exitButton.id = "exit-button";
        exitButton.innerHTML = "X";
        exitButton.addEventListener("click", () => {
            document.getElementById("image-gallery").remove();
        });

        //   stylize the exit button to look good: this can also be a css class
        exitButton.style.position = "fixed";
        exitButton.style.top = "15%";
        exitButton.style.right = "15%";
        exitButton.style.borderRadius = "0";
        exitButton.style.padding = "1rem";
        exitButton.style.fontSize = "2rem";
        exitButton.style.fontWeight = "bold";
        exitButton.style.backgroundColor = "white";
        exitButton.style.border = "none";
        exitButton.style.cursor = "pointer";
        exitButton.style.zIndex = "1";
        imageGallery.appendChild(exitButton);

        //how does each exit button and text correspond to each other?
        //how do new images get added with each new submission?

        // add text to image gallery
        const textDiv = document.createElement("div");
        textDiv.id = "image-gallery-text";
        textDiv.innerHTML = text;

        // add fixed styling if in modal view
        textDiv.style.position = "fixed";
        textDiv.style.top = "15%";
        textDiv.style.left = "15%";
        // textDiv.style.right = "0";
        textDiv.style.borderRadius = "2";
        textDiv.style.padding = "1rem";
        textDiv.style.fontSize = "1rem";

        imageGallery.appendChild(textDiv);

        // append the image gallery to the body
        document.body.appendChild(imageGallery);
    }
    function flyToClick(coords) {
        map.flyTo({
            center: [coords[0], coords[1]],
            zoom: 17,
            essential: true, // this animation is considered essential with respect to prefers-reduced-motion
        });
    }
    // create “current location” function, which doesn’t trigger until called upon.
    function addUserLocation(latitude, longitude) {
        return map.addLayer(
            new MapboxLayer({
                id: "user-location",
                type: ScatterplotLayer,
                data: [{ longitude, latitude }],
                getPosition: (d) => [d.longitude, d.latitude],
                getSourceColor: [0, 255, 0],
                sizeScale: 15,
                getSize: 10,
                radiusUnits: "pixels",
                getRadius: 5,
                opacity: 0.7,
                stroked: false,
                filled: true,
                radiusScale: 3,
                getFillColor: [3, 202, 252],
                parameters: {
                    depthTest: false,
                },
            })
        );
    }
    // get current location
    const successCallback = (position) => {
        // add new point layer of current location to deck gl
        const { latitude, longitude } = position.coords;
        addUserLocation(latitude, longitude);
    };

    const errorCallback = (error) => {
        console.log(error);
    };

    // create async function to await for current location and then return the promise as lat long coordinates then resolve the promise
    function getCurrentLocation() {
        const currentLocation = navigator.geolocation.getCurrentPosition(
            successCallback,
            errorCallback
        );
        return currentLocation;
    }
    if (navigator.geolocation) {
        getCurrentLocation();
    }

    const locationButton = document.createElement("div");
    // create a button that will request the users location
    locationButton.textContent = "Where am I?";
    locationButton.id = "location-button";
    locationButton.addEventListener("click", () => {
        // when clicked, get the users location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;

                locationButton.textContent =
                    "Where am I? " +
                    position.coords.latitude.toFixed(3) +
                    ", " +
                    position.coords.longitude.toFixed(3);

                addUserLocation(latitude, longitude);
                flyToClick([longitude, latitude]);
            });
        }
    });
    document.body.appendChild(locationButton);
});
// After the last frame rendered before the map enters an "idle" state.
/*
map.on('idle', () => {
    console.log(map.getStyle().layers)
    // If these two layers were not added to the map, abort
    
    if (!map.getLayer('deckgl-circle')) {
        return;
    }

    // Enumerate ids of the layers.
    const toggleableLayerIds = [['penn_traffic', 'Congestion']];

    // Set up the corresponding toggle button for each layer.
    for (const id_pair of toggleableLayerIds) {
        button_name = id_pair[1]
        id = id_pair[0]
        // Skip layers that already have a button set up.
        if (document.getElementById(id)) {
            continue;
        }

        // Create a link.
        const link = document.createElement('a');
        link.id = id;
        link.href = '#';
        link.textContent = button_name;
        link.className = 'active';

        // Show or hide layer when the toggle is clicked.
        link.onclick = function (e) {
            const clickedLayer = this.id;
            e.preventDefault();
            e.stopPropagation();

            const visibility = map.getLayoutProperty(
                clickedLayer,
                'visibility'
            );

            // Toggle layer visibility by changing the layout object's visibility property.
            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                this.className = '';
            } else {
                this.className = 'active';
                map.setLayoutProperty(
                    clickedLayer,
                    'visibility',
                    'visible'
                );
            }
        };
        const layers = document.getElementById('menu');
        layers.appendChild(link);
    }
});*/

// Create a function to access the jotform submissions . Format: (formID, callback)
function getSubmissions() {
    // ENTER YOUR NEW FORM SUBMISSION ID HERE
    JF.getFormSubmissions("223193774186060", function (responses) {
        console.log(responses)
        // array to store all the submissions: we will use this to create the map
        const submissions = [];
        // for each responses
        for (var i = 0; i < responses.length; i++) {
            // create an object to store the submissions and structure as a json
            const submissionProps = {};

            submissionProps["type"] = "Feature";
            submissionProps["geometry"] = {
                type: "Point",
            };
            submissionProps["properties"] = {};

            // add all fields of responses.answers to our object
            const keys = Object.keys(responses[i].answers);
            keys.forEach((answer) => {
                let currentAnswer = responses[i].answers[answer].answer;
                if (!currentAnswer) {
                    // delete the key if the answer is empty
                    delete responses[i].answers[answer];
                    return;
                }
                const lookup = "name";
                const entry = responses[i].answers[answer].name;

                if (entry === "latitude" || entry === "longitude") {
                    currentAnswer = parseFloat(currentAnswer);
                }

                submissionProps.properties[responses[i].answers[answer][lookup]] =
                    currentAnswer;
            });

            submissionProps.geometry["coordinates"] = [
                submissionProps.properties.latitude,
                submissionProps.properties.longitude,
            ];

            // add submission to submissions array
            submissions.push(submissionProps);
        }

        // see if the source exists
        if (map.getSource("submissions")) {
            // update the source
            map.getSource("submissions").setData({
                type: "FeatureCollection",
                features: submissions,
            });
        }

        map.on("load", () => {
            map.addSource("submissions", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: submissions,
                },
            });

            map.addLayer({
                id: "submissions",
                type: "circle",
                source: "submissions",
                paint: {
                    "circle-radius": 5,
                    "circle-color": "#2e8c29",
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "#000000",
                },
            });
        });
    });
}

// BEGIN LEGEND



// Function for drawing circles in legend
function draw_circle(canvas, size, color) {
    console.log("calling draw circle with color", color)
    canvas.width = 30
    canvas.height = 30
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000000";
    //ctx.lineWidth = 2
    ctx.fillStyle = color;
    console.log("my fill style is ", ctx.fillStyle)
    console.log(ctx.strokeStyle)
    ctx.beginPath();
    ctx.arc(15, 15, size, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.stroke();
}

// Function for defining point elements on legend
function define_point(color, size, name) {
    const point_label = document.createElement("div")
    point_label.className = "legend-point-label"
    const label_text = document.createElement("p")
    label_text.textContent = name;
    point_label.appendChild(label_text)

    const point_drawing = document.createElement("div")
    point_drawing.className = "legend-point"
    const point_canvas = document.createElement("canvas", { width: 100, height: 100 })
    console.log("calling draw circle with color", color)
    draw_circle(point_canvas, size, color)
    point_drawing.appendChild(point_canvas)

    const point = document.createElement("div");
    point.className = "legend-section"
    point.appendChild(point_drawing)
    point.appendChild(point_label)

    return point
}

function add_checkbox(content, layer_id) {
    const existing_content = document.createElement("legend-section-no-check");
    existing_content.className = "legend-section-no-check"
    existing_content.appendChild(content)

    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.id = layer_id
    checkbox.checked = true

    checkbox.onclick = function (e) {
        const clickedLayer = this.id;
        e.stopPropagation();

        const visibility = map.getLayoutProperty(
            clickedLayer,
            'visibility'
        );

        console.log(visibility)

        // Toggle layer visibility by changing the layout object's visibility property.
        if (visibility != 'none') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(
                clickedLayer,
                'visibility',
                'visible'
            );
        }
    };

    const checkbox_div = document.createElement("div")
    checkbox_div.className = "legend-check"
    checkbox_div.appendChild(checkbox)

    const with_check = document.createElement("div")
    with_check.appendChild(existing_content)
    with_check.appendChild(checkbox_div)

    return with_check
}

// Initialize title and content for traffic section of legend
const traffic_description = document.createElement("p");
traffic_description.id = "legend-description";
traffic_description.textContent = "Average Annual Daily Traffic";

const traffic_content = document.createElement("div")
traffic_content.className = "legend-items";

const [legendValues, legendColors] = [[0, 150, 1000, 132139], ["hsl(100, 89%, 52%)", "hsl(54, 91%, 46%)", "hsl(0, 91%, 46%)", "hsl(0, 87%, 30%)"]];

legendValues.forEach((layer, i) => {
    const color = legendColors[i];
    const item = document.createElement("div");
    const key = document.createElement("div");
    key.className = "legend-key";
    key.style.backgroundColor = color;

    const value = document.createElement("div");
    value.innerHTML = `${layer}`;
    item.appendChild(key);
    item.appendChild(value);
    traffic_content.appendChild(item);
});

const traffic = document.createElement("div");
traffic.className = "legend-section"
traffic.appendChild(traffic_description)
traffic.appendChild(traffic_content);
traffic_with_check = add_checkbox(traffic, "penn_traffic")

// Initialize title and content for ECHO API data
echo = add_checkbox(define_point("#74048f", 7, "Facilities with Pollution Law Violations"), "echo-api-bv863a")

// Initialize title and content for sensor location submission data
sensor_recs = add_checkbox(define_point("#2e8c29", 7, "Suggested Air Quality Sensor Locations"), "submissions")

// Initialize title and content for air pollution sensor data
air_sensors = add_checkbox(define_point("#291e9e", 10, "Current Locations of Air Quality Sensors"), "air")

incident_reports = add_checkbox(define_point("#fcba03", 10, "Current air pollution incidents"), "incidents")

// Initialize dictionary of legend sections
legend_sections = {
    "congestion": {
        "on": true,
        "content": traffic_with_check,
    },
    "echo": {
        "on": true,
        "content": echo,
    },
    "sensor_recs": {
        "on": true,
        "content": sensor_recs
    },
    "air_sensors":
    {
        "on": true,
        "content": air_sensors
    },
    incident_reports: {
        "on": true,
        "content": incident_reports
    }
}

// When the map loads, load the legend
map.on("load", () => {
    // create legend
    const legend = document.getElementById("legend");

    //   create a title for the legend
    const title = document.createElement("h2");
    title.id = "legend-title";
    title.textContent = "Legend";
    legend.appendChild(title);
    //   create a child element for the legend explaining the metric

    for (let [_, section] of Object.entries(legend_sections)) {
        if (section["on"]) {
            legend.appendChild(section["content"])
        }
    }

    const firstLabelLayerId = map
        .getStyle()
        .layers.find((layer) => layer.type === "symbol").id;

    console.log(firstLabelLayerId)

    /*checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.id = "penn_traffic"
  
    checkbox.onclick = function (e) {
      const clickedLayer = this.id;
      e.stopPropagation();
  
      const visibility = map.getLayoutProperty(
          clickedLayer,
          'visibility'
      );
  
      // Toggle layer visibility by changing the layout object's visibility property.
      if (visibility === 'visible') {
          map.setLayoutProperty(clickedLayer, 'visibility', 'none');
          this.className = '';
      } else {
          this.className = 'active';
          map.setLayoutProperty(
              clickedLayer,
              'visibility',
              'visible'
          );
      }
    };
  
    legend.appendChild(checkbox)*/
});

// END LEGEND

// immediately call the function to get the submissions
getSubmissions();

// create a popup on hover
const hoverPopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
});

// add a hover event that shows a hoverPopup with the description
map.on("mouseenter", "submissions", (e) => {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = "pointer";

    const coordinates = e.features[0].geometry.coordinates.slice();
    console.log(e.features[0])
    // create some HTML objects to render in the popup
    const htmlContainer = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = e.features[0].properties.placeName;
    const description = document.createElement("p");
    description.innerHTML = e.features[0].properties.undefined;

    // append the HTML objects to the container
    htmlContainer.appendChild(title);
    htmlContainer.appendChild(description);

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the hoverPopup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the hoverPopup and set its coordinates
    hoverPopup.setLngLat(coordinates).setHTML(htmlContainer.outerHTML).addTo(map);
});

// hide the hoverPopup when the mouse leaves the layer
map.on("mouseleave", "submissions", () => {
    // set the cursor back to default
    map.getCanvas().style.cursor = "";
    // remove the hoverPopup
    hoverPopup.remove();
});

// create a popup for click events
const popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true,
});

// create a global timeout that can be used to refresh the data on the map
let timeout;

// on click of the map add a new point to the map
map.on("click", (e) => {
    // create a new geojson object from click
    const newPoint = {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [e.lngLat.lng, e.lngLat.lat],
        },
        properties: {
            description: "",
        },
    };
    //   add a new point to the map
    if (map.getSource("newPoint")) {
        //if the source already exists, update the source
        // map.getSource("newPoint").setData(newPoint);
    } else {
        //if its the first time the user has clicked, add the source and layer
        map.addSource("newPoint", {
            type: "geojson",
            data: newPoint,
        });
        // add a new layer to the map
        map.addLayer({
            id: "newPoint",
            type: "circle",
            source: "newPoint",
            paint: {
                "circle-radius": 10,
                "circle-color": "#f30",
                "circle-stroke-width": 1,
                "circle-stroke-color": "#000000",
            },
        });
    }

    //make callback function on submit to update the new point with the description and then submit to jotform
    const updateDescription = (location) => {
        /**
         * this function will update the description of the new point and then submit the data to jotform.
         * Since it is a function it will only trigger when called upon by the submit button.
         * @param {string} location - the location of the new point
         * @param {string} description - the description of the new point
         * @param {object} submission - the submission object
         */

        // clear the existing timeout if it is about to trigger
        clearTimeout(timeout);

        // get the description from the input
        const description = document.getElementById("description").value;
        newPoint.properties.description = description;
        newPoint.properties.placeName = location;
        // add name and email to newpoint
        newPoint.properties.name = document.getElementById("name").value;
        newPoint.properties.email = document.getElementById("email").value;

        map.getSource("newPoint").setData(newPoint);

        // add a new jotform submission
        const submission = new Object();

        /**
         * MAKE SURE TO UPDATE THE NUMBERS INSIDE OF THE SQUARE BRACKETS HERE TO CORRESPOND TO THE WAY YOU STRUCTURED YOUR JOFORM
         * REFER TO MY EMAIL TO SEE HOW YOUR ANSWERS ARE COMING IN
         * THANKS
         */

        // name
        submission[3] = newPoint.properties.name;
        // email
        submission[4] = newPoint.properties.email;
        // place name
        submission[5] = newPoint.properties.placeName;
        // latitude
        submission[6] = newPoint.geometry.coordinates[1];
        // longitude
        submission[7] = newPoint.geometry.coordinates[0];
        // description
        submission[9] = newPoint.properties.description;
        if (
            // if everything has been filled out
            newPoint.properties.description &&
            newPoint.properties.name &&
            newPoint.properties.email
        ) {
            // submit the data to jotform and remove the popup
            popup.remove();
            JF.createFormSubmission(
                "223193774186060",
                submission,
                function (response) {

                    // assign a timeout to the global timeout variable and reload the map after 3 seconds
                    timeout = setTimeout(() => {
                        getSubmissions();
                    }, 3000);
                }
            );
        } else {
            alert("Please fill out all fields");
            // assign a yellow outline to the popup
        }
    };

    async function getLocationName() {
        // reverse geocode the point using fetch
        await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${e.lngLat.lng},${e.lngLat.lat}.json?access_token=${mapboxgl.accessToken}`
        )
            .then((response) => response.json())
            .then((data) => {
                const location = data.features[0].place_name
                    .split(",")
                    .slice(0, 2)
                    .join(",");

                //   add a popup to the new point with a textarea input field
                const htmlContainer = document.createElement("div");
                const title = document.createElement("h4");
                title.textContent = "Suggest sensor location at " + location;

                // create name and email input fields
                const nameInput = document.createElement("input");
                nameInput.setAttribute("type", "text");
                nameInput.setAttribute("id", "name");
                nameInput.setAttribute("placeholder", "name");
                nameInput.addEventListener("input", (e) => {
                    newPoint.properties.name = e.target.value;
                });

                const emailInput = document.createElement("input");
                emailInput.setAttribute("type", "email");
                emailInput.setAttribute("id", "email");
                emailInput.setAttribute("placeholder", "email");
                emailInput.addEventListener("input", (e) => {
                    newPoint.properties.email = e.target.value;
                });

                // create description input
                const textarea = document.createElement("textarea");
                textarea.id = "description";
                textarea.placeholder = "reason for sensor location";
                textarea.style.resize = "none";

                // create submit button
                const submitButton = document.createElement("button");
                submitButton.id = "submit";
                submitButton.textContent = "Submit";

                // append all the elements to the html container
                htmlContainer.appendChild(title);
                htmlContainer.appendChild(textarea);
                htmlContainer.appendChild(nameInput);
                htmlContainer.appendChild(emailInput);
                htmlContainer.appendChild(submitButton);

                // add the popup to the map
                popup
                    .setLngLat([e.lngLat.lng, e.lngLat.lat])
                    .setHTML(htmlContainer.outerHTML)
                    .addTo(map);

                // get the newly added submit button and call the updateDescription function on click
                const appendedSubmitButton = document.getElementById("submit");
                appendedSubmitButton.addEventListener("click", function () {
                    updateDescription(location);
                });
            });
    }
    // call the getLocationName function, which triggers the popup and updateDescription function
    getLocationName();
});

// close the click popup when pressing the escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        popup.remove();
    }
});
// instantiate a popup for the basemap
const basemapPopup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
});
