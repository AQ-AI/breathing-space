JF.initialize({ apiKey: "e83551f0a2681795a8e8ae7d06535735" });

JF.getFormSubmissions("223104390365146", function (response) {
  console.log(response);
  // array to store all the submissions: we will use this to create the map
  const submissions = [];
  console.log("created submissions")
  // for each response
  for (var i = 0; i < response.length; i++) {
    console.log("length of response?")
    console.log(response.length)
    console.log(i)
    // create an object to store the submissions and structure as a json
    const submissionProps = {};

    // add all fields of response.answers to our object
    const keys = Object.keys(response[i].answers);
    keys.forEach((answer) => {
      const lookup = response[i].answers[answer].cfname ? "cfname" : "name";
      submissionProps[response[i].answers[answer][lookup]] =
        response[i].answers[answer].answer;
    });
    if (submissionProps["Address Map Locator"] == null) {
      console.log("hopping out!");
      continue;
    }
    console.log("hi");
    console.log(submissionProps["Address Map Locator"]);
    // convert location coordinates string to float array
    submissionProps["Address Map Locator"] = submissionProps[
      "Address Map Locator"
    ].split(/\r?\n/).map((x) => parseFloat(x.replace(/[^\d.-]/g, "")))

    console.log(submissionProps);

    // add submission to submissions array
    submissions.push(submissionProps);

  }

  console.log(submissions)

  // Import Layers from DeckGL
  const { MapboxLayer, ScatterplotLayer } = deck;

  // YOUR MAPBOX TOKEN HERE
  mapboxgl.accessToken = "pk.eyJ1IjoibHNocmFjayIsImEiOiJjbDl3dXJubzkwNDliM3BxZWlnM3M5OHc5In0.DxE42LtIN08VTvEqZEyxsw";

  const map = new mapboxgl.Map({
    container: document.body,
    style: "mapbox://styles/lshrack/cl9wuv2q5000314qhpuc79ust", // Your style URL
    center: [-71.10326, 42.36476], // starting position [lng, lat]
    zoom: 12, // starting zoom
    projection: "globe", // display the map as a 3D globe
  });

  map.on("load", () => {
    const firstLabelLayerId = map
      .getStyle()
      .layers.find((layer) => layer.type === "symbol").id;

    map.addLayer(
      new MapboxLayer({
        id: "deckgl-circle",
        type: ScatterplotLayer,
        data: submissions,
        getPosition: (d) => {
          return d["Address Map Locator"];
        },
        // Styles
        radiusUnits: "pixels",
        getRadius: 10,
        opacity: 0.7,
        stroked: false,
        filled: true,
        radiusScale: 3,
        getFillColor: [255, 0, 0],
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 255],
        parameters: {
          depthTest: false,
        },
        onClick: (info) => {
          //ADD NEW INPUT TO GETIMAGE GALLERY: 
          getImageGallery(info.object.fileUpload, info.object.describeThe);
          flyToClick(info.object["Address Map Locator"]);
        },

      }),
      firstLabelLayerId
    );

    function getImageGallery(images, text) {
      const imageGallery = document.createElement("div");
      imageGallery.id = "image-gallery";

      for (var i = 0; i < images.length; i++) {
        const image = document.createElement("img");
        image.src = images[i];
        image.style = "width:50%;height:50%;"

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
      exitButton.style.top = "0";
      exitButton.style.right = "0";
      exitButton.style.borderRadius = "0";
      exitButton.style.padding = "1rem";
      exitButton.style.fontSize = "2rem";
      exitButton.style.fontWeight = "bold";
      exitButton.style.backgroundColor = "white";
      exitButton.style.border = "none";
      exitButton.style.cursor = "pointer";
      exitButton.style.zIndex = "1";


      imageGallery.appendChild(exitButton);

      // add text to image gallery
      const textDiv = document.createElement("div");
      textDiv.id = "image-gallery-text";
      textDiv.innerHTML = text;

      // add fixed styling if in modal view
      textDiv.style.position = "fixed";
      textDiv.style.top = "0";
      textDiv.style.left = "0";
      textDiv.style.right = "0";
      textDiv.style.borderRadius = "0";
      textDiv.style.padding = "2rem";
      textDiv.style.fontSize = "2rem";

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

    // append the button
    document.body.appendChild(locationButton);

  });

});