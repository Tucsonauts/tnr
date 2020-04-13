window.addEventListener("load", doEverything());//switch to everythingfunction2 when ready to make the leap to the cleaner code

function doEverything(){
  loadParameters();
  illCleanThisFunctionUpLater();
  addAllbuttonfunctionality();
  //all my other code here
}

function loadParameters(){
    myHostAddress = "http://localhost:8080/ors";
    myAPI = API.ors;
 
  // Various Paramaters for OpenRouteService Directions Calculation
    W = {
      extra_info: ["waytype"], //turn this on for custom API
      elevation: false, //turn this on for custom API
      profile: "cycling-regular",
      preference: "shortest", //fastest, shortest, recommended
      extra_info: ["waytype", "steepness"], //“steepness”, “suitability”, “surface”, “waycategory”, “waytype”, “tollways”, “traildifficulty”, “roadaccessrestrictions”
      format: "geojson",
      units: "mi" //km, mi, m
    }
}

function addAllbuttonfunctionality(){
    //----------Search Bar------------//
    //When the geocoder (i.e. the search bar) is engaged/triggered/used/etc... dropdown the Button for Generating Directions
    geocoder.on('result', function(e) {
      document.getElementById("directionhere").classList.add("directionbuttonvisable");
      document.getElementById("directionhere").innerHTML = "Get Route to " + geocoder._typeahead.selected.text;
    });

    //----------Get Route Button ------------// 
    //When the 'Get Route' Button is Clicked, Get Directions
    document.getElementById("directionhere").addEventListener("click", SearchBarDirections);

    
    //----------Safe Route Toggle ------------//
    $(function() {
      $('#routerToggle').change(function() {
        if (checkRouteOnScreen()) {
          //route is on screen and subsequently source layer is loaded 
          removeRouteLayerAndSource();
        }
        generateRoute();
      })
    })

    //----------Draw Route------------//
    document.getElementById("drawRoute").addEventListener("click", drawUsingPoints);

}

function drawUsingPoints(){
  if (checkRouteOnScreen()) {
    //Route already exists on map
      removeRouteLayerAndSource();
      clearWCoordinates();
  }
  //Documentation: https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/MODES.md
  // document.body.style.cursor = "crosshair"; not working. I just wrote a css class that changes it to crosshair permanently for now..
    var LotsOfPointsMode = {};

  // When the mode starts this function will be called.
  // The `opts` argument comes from `draw.changeMode('lotsofpoints', {count:7})`.
  // The value returned should be an object and will be passed to all other lifecycle functions
    LotsOfPointsMode.onSetup = function(opts) {
      var state = {};
      state.count = opts.count || 0;
      return state;
    };

  // Whenever a user clicks on the map, Draw will call `onClick`
    LotsOfPointsMode.onClick = function(state, e) {
      // `this.newFeature` takes geojson and makes a DrawFeature
      var point = this.newFeature({
        type: 'Feature',
        properties: {
          count: state.count
        },
        geometry: {
          type: 'Point',
          coordinates: [e.lngLat.lng, e.lngLat.lat]
        }
      });
      this.addFeature(point); // puts the point on the map
    };

  // Whenever a user clicks on a key while focused on the map, it will be sent here
    LotsOfPointsMode.onKeyUp = function(state, e) {
      if (e.keyCode === 27) return this.changeMode('simple_select');
    };

  // This is the only required function for a mode.
  // It decides which features currently in Draw's data store will be rendered on the map.
  // All features passed to `display` will be rendered, so you can pass multiple display features per internal feature.
  // See `styling-draw` in `API.md` for advice on making display features
    LotsOfPointsMode.toDisplayFeatures = function(state, geojson, display) {
      display(geojson);
    };

  //Parameters of MapboxDraw Tool
    var draw = new MapboxDraw({
        displayControlsDefault: false, //default true - but I want custom controls (just points and trash)
        accessToken: "pk.eyJ1IjoiZHlsYW5jIiwiYSI6Im53UGgtaVEifQ.RJiPqXwEtCLTLl-Vmd1GWQ",
        defaultMode: 'lots_of_points',
        modes: Object.assign({
          lots_of_points: LotsOfPointsMode,
        }, MapboxDraw.modes),
        clickBuffer: 20, //default 2 - for mouse: # of pixels buffer around vertex that will respond to click
        touchBuffer: 25, //default 25 - Same as above but for touch
        // keybindings: true, //default true
        // touchEnabled: true, //default true
        // boxSelect: true, //default true
        controls: {
        //   point: true,
          trash: true,
        //   line_string: true
        },
        //styles examples : https://github.com/mapbox/mapbox-gl-draw/blob/master/docs/EXAMPLES.md
        styles: [
            {
              'id': 'regular-points-halo-rim',
              'type': 'circle',
              'filter': ['all',
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['==', 'active', 'false']],
              'paint': {
                'circle-radius': 10,
                'circle-color': '#4f7ba4'
              }
            },
            {
              'id': 'regular-points-halo',
              'type': 'circle',
              'filter': ['all',
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['==', 'active', 'false']],
              'paint': {
                'circle-radius': 9,
                'circle-color': '#f9f9f9'
              }
            },
            {
              'id': 'regular-points',
              'type': 'circle',
              'filter': ['all',
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['==', 'active', 'false']],
              'paint': {
                'circle-radius': 6,
                'circle-color': '#4f7ba4'
              }
            },
            {
              'id': 'highlight-selected-points-halo-rim',
              'type': 'circle',
              'filter': ['all',
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['==', 'active', 'true']],
              'paint': {
                'circle-radius': 14,
                'circle-color': '#bc5050'
              }
            },
            {
              'id': 'highlight-selected-points-halo',
              'type': 'circle',
              'filter': ['all',
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['==', 'active', 'true']],
              'paint': {
                'circle-radius': 13,
                'circle-color': '#f9f9f9'
              }
            },
            {
              'id': 'highlight-selected-points',
              'type': 'circle',
              'filter': ['all',
                ['==', '$type', 'Point'],
                ['==', 'meta', 'feature'],
                ['==', 'active', 'true']],
              'paint': {
                'circle-radius': 9,
                'circle-color': '#bc5050'
              }
            },
        ]
      });

  // Add the Draw control to your map
    map.addControl(draw);
}

function checkRouteOnScreen(){
  if (typeof(map.getLayer('R_layer')) !== "undefined") {
    //layer exists
    return true
  }
  else {
    return false
  }
}

function SearchBarDirections(){ /*the new version of ComputerDirections()*/
  //Test if A Route is already on Screen
  if (checkRouteOnScreen()) {
    //Route already exists on map
      removeRouteLayerAndSource();
      clearWCoordinates();
  }
  findCurrentPosition(); //Saves the geotagged user position as a coordinate
  findTargetsPosition(); //Saves the searched POI as a coordinate
  //I eventually want generateRoute() to live here, but no matter what I do geolocate.on('geolocate', (...)) fires at the very end of the script
  //             so I have to have geolocate.on(){... generateRoute(){ addRouteLayer()}, and whatever else in there} 

}

function findCurrentPosition() {
  geolocate.trigger();
  geolocate.on('geolocate', function(e) {
    //THIS IS LIKE THE LAST THING EVER FIRED IN THE FUNCTION. THIS WILL NO MATTER
    //WHAT BE WHERE THE END OF THE JAVASCRIPT LIVES. 
    //DONT ASK ME BUT GEOLOCATE.ON IS LIKE THE VERY LAST THING TO FIRE NO MATTER WHAT!
      let lng = e.coords.longitude;
      let lat = e.coords.latitude;
      W.coordinates[0] = [lng, lat];
      generateRoute(); //THIS NEEDS TO BE HERE
    });

}

function findTargetsPosition(){
  //Set Finish Coordinates - geocoder was activated in the first few lines of addAllbuttonfunctionality 
  let lng = geocoder.mapMarker._lngLat.lng;
  let lat = geocoder.mapMarker._lngLat.lat 
  W["coordinates"] = []; //create the coordinates array
  W.coordinates[0] = []; //create the array in the array, that will hold the first coordinate
  W.coordinates[1] = [];
  W.coordinates[1] = [lng, lat];
}

function coordinateChecker(){
  if (W.coordinates[0].length == 0) {
    console.log("W.coordinate[0] is undefined");
    findCurrentPosition();
  }
  else 
    console.log("W.coordinate[0] is finally definied");
    //generateRoute();
}

function updatePoint(startOrFinish,longAndLat){
  if (startOrFinish == "start") {
    W.coordinates[0] = longAndLat;
  }
  if (startOrFinish == "finish") {
    W.coordinates[1] = longAndLat;
  }
  removeRouteLayerAndSource();
  generateRoute();
}

function generateRoute() {
  //First, check if 'Safe Routing' is On or Off
  let RouterToggleStatus = document.getElementById('routerToggle').checked //Either True or False, Depending on routerToggle state
  
  if (RouterToggleStatus == true) {
    generateSafeRoute();
  }
  else {
    generateDangerousRoute();
  }
}

function generateSafeRoute(){
  //Add necessary parameters to list of parameters needed for ORS Directions call
    W["preference"] = "recommended"; //I think it can't be recommended, needs to be fastest
    W["elevation"] = false; //Pretty sure it can't be true, needs to be false
    W["options"] = { //required for custom weighting
      profile_params: {
        weightings: { green: .5 }
      }
    };
    W["host"] = myHostAddress; //required to point to my online graphs

    console.log("Open Route Service Input Parameters");
    console.log(JSON.stringify(W));

    let orsDirections = new Openrouteservice.Directions({
      // api_key: myAPI,
      host: myHostAddress
    });

    orsDirections.calculate(W)
      .then(function(json) {
        if (typeof R !== 'undefined') { //Okay, reminder: R is my variable I use for the returned ORS geojson route
            delete R;                   //  If it is already defined, I need to delete it, so when it resaves in R = json
        }                                // It will do so as a global variable. If its already defined, it will only save locally, which is bad.
        R = json;
        console.log("Open Route Services Output Geojson")
        console.log(JSON.stringify(R));
        addRouteLayer(R);
      })
      .catch(function(err) {
          console.error(err);
      });
  };

function generateDangerousRoute(){
  //*** I need to write an if statement that checks if W["optoins"] & W["host"] exists
  //*** If it does exist, I need to delete those off of W before using it in the Directions call

  if (W.host == myHostAddress) {
    delete W.host;
    delete W.options;
    W.elevation = true;
    W.preference = "shortest";
  }

  orsDirections = new Openrouteservice.Directions({
    api_key: myAPI,
  });

  orsDirections.calculate(W)
    .then(function(json) {
        if (typeof R !== 'undefined') { //Okay, reminder: R is my variable I use for the returned ORS geojson route
            delete R;                   //  If it is already defined, I need to delete it, so when it resaves in R = json
        }                                // It will do so as a global variable. If its already defined, it will only save locally, which is bad.
        R = json;
        console.log("Open Route Services Output Geojson")
        console.log(JSON.stringify(R));
        addRouteLayer(R);
      })
      .catch(function(err) {
          console.error(err);
      });
}

function addRouteLayer(e){
  if (checkRouteOnScreen()) { //Check if a route is already on screen, before this function trying to put another up and runs into an error
    removeRouteLayerAndSource();
  }
    //Use Mapbox to visualize json directions on Map
    map.addSource('R_source', { type: 'geojson', data: e });
    map.addLayer({
      "id": "R_layer",
      "type": "line",
      "source": "R_source",
      "paint": {
        "line-color": "black",
        "line-opacity": 0.75,
        "line-width": 3
      }
    });
}

function removeRouteLayerAndSource(){
  map.removeLayer("R_layer");
  map.removeSource("R_source");
  delete R;
}

function clearWCoordinates(){
  W.coordinates[0] = [];
  W.coordinates[1] = [];
}


//Work on this later
// var orsDistance = R.features[0].properties.segments[0].distance;
//       var orsDistance = orsDistance.toFixed(1); //round to tenth place
//       var orsReturnedSteps = R.features[0].properties.segments[0].steps
//       var summaryDirections = "";
//       for (i = 0; i < orsReturnedSteps.length; i++) {
//         summaryDirections += orsReturnedSteps[i].instruction + "<br />";
//       }
//       document.getElementById("exampleModalLongTitle2").innerHTML = "";
//       document.getElementById("exampleModalLongTitle2").innerHTML = orsDistance + " Miles";                  

//       document.getElementById("routeDirections").innerHTML = "";
//       document.getElementById("routeDirections").innerHTML = summaryDirections;
//       // console.log(JSON.stringify(json));