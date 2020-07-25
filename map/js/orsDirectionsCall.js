window.addEventListener("load", doEverything());//switch to everythingfunction2 when ready to make the leap to the cleaner code

function doEverything(){
  illCleanThisFunctionUpLater();
}

// function OOP(){
  let parametersGHsafe = {
    host: "http://localhost:8989", //host: "http://localhost:8989",
    profile: "pathways_v2", // "car_co2", "bike_canturn", "pathways_v2"
    //Code does not like any parameter that isn't the profile
    //vehicle: "bike",
    //weighting: "shortest", //weighting: "custom",
    //turn_costs: false, 
    // elevation: false,
    details: ["road_class", "distance"]
  }

  let parametersCO2Car = {
    host: "http://localhost:8989", //host: "http://localhost:8989",
    profile: "car_co2", // "car_co2", "bike_canturn", "pathways_v2"
    //Does not like any parameter that isn't the profile parameter
    //vehicle: "bike",
    //weighting: "shortest", //weighting: "custom",
    //turn_costs: false, //turn_costs: true, DOES NOT LIKE THIS PARAMETER IN CURRENT GRAPH ITTERATION
    // elevation: false,
    //details: ["road_class", "distance"]
  }

  let parametersGHdangerous = {
    host: "http://localhost:8989",
    profile: "bike_canturn", //"car_co2", "bike_canturn", "pathways_v2"
    //Does not like any parameter that isn't the profile
    //weighting: "fastest",
    //turn_costs: false,
    // key: keys.graphhopper,
    // elevation: false,
    details: ["road_class", "distance"]
  }

  let parameters = parametersGHsafe;
  AllMarkers = [];
  let counter = 0;
  let mode = "closed";
  let safe = true;
  // let myIsochrone = new Isochrone();

  //Button Functionality
    let CO2 = {
      Measure: function() {
                  let sum = 0;
                  for (i = 1; i < AllMarkers.length; i++) {
                    let distanceMiles = AllMarkers[i].CO2geojson.paths[0].distance/5280;
                    let yourCarMPG = 25;
                    let poundsCO2ProducedPerGallonOfGas = 20;
                    let LbsofCO2 = distanceMiles * yourCarMPG / poundsCO2ProducedPerGallonOfGas;
                    sum = Math.round((sum + LbsofCO2)*100)/100;
                  }
                  return sum;
                },
      Display: function() {
                  // alert(CO2.Measure(AllPOIs));      
                  document.getElementById("offsetinsert").innerHTML = CO2.Measure();
                  document.getElementById("offsetunits").innerHTML = " lbs CO2";
                  document.getElementById("offsettext").innerHTML = "Offset from Atmosphere";
                }
    }

    let Search = {
      generateRoute: function(e){
        $('#directionshere').toggleClass('directionsbuttonvisible'); //I know this is super hacky to put button behavior in my routing function, but this was the only spot i could get it to work, and I'm lazy tonight
            if (AllMarkers.length>0) {
              for (i = AllMarkers.length; i>=0; i--){
                undoLastMarker();
              }
            }
              // geolocate.options.trackUserLocation = false;
              geolocate.trigger();
              setTimeout(function(){
                mode = "geolocate";
                AddMarker();
                mode = "searched";
                AddMarker();
              }, 1000);
              // setTimeout(function(){ 
              //   // mode = "geolocate";
              //   // AddMarker();
              //   // mode = "searched";
              //   // AddMarker();
              //  }, 3000);
              // geolocate.on("geolocate", function(e){
              //   mode = "geolocate";
              //   AddMarker();
              //   mode = "searched";
              //   AddMarker();
              // });
                mode = "closed";
              // geolocate.options.trackUserLocation = true;
              // setTimeout(function(){ geolocate.trigger() }, 1000);
      }
    }

    let ToggleSafeRouting = function(){
        if (safe == true) {
          safe = false;
        }
        else {
          safe = true;
        }
        if (safe == true) {
          if (AllMarkers.length>0) {
            for (i = AllMarkers.length - 1; i > 0; i-- ) {
              map.removeLayer(AllMarkers[i].layer);
              map.removeSource(AllMarkers[i].source);
            } 
          }
          parameters = parametersGHsafe;
            for (i = 0; i < AllMarkers.length-1; i++ ) {
              AllMarkers[i].calculateRoute(AllMarkers[i],AllMarkers[i+1]);
            } 
        }
        else if (safe == false) {
          if (AllMarkers.length>0) {
            for (i = AllMarkers.length - 1; i > 0; i-- ) {
              map.removeLayer(AllMarkers[i].layer);
              map.removeSource(AllMarkers[i].source);
            } 
          }
          parameters = parametersGHdangerous;
            for (i = 0; i < AllMarkers.length-1; i++ ) {
              AllMarkers[i].calculateRoute(AllMarkers[i],AllMarkers[i+1]);
            } 
        }
      } 

  function undoLastMarker(){
    if (AllMarkers.length>0){
      let l = AllMarkers.length - 1;
      let lastmarker = AllMarkers[l];
      lastmarker.destoryMarkersRoute();
      lastmarker.vaporizeMarker();
      lastmarker.recount();
      CO2.Display();
    }
  }

  function setDrawMode(_mode) {
      mode = _mode;
  }

  function toggleDrawMode() {
    if(mode !== "drawing") {
      mode = "drawing";
      centerdot.remove();
      delete centerdot;
    } else {
      mode = "crosshair";
      centerdot = new mapboxgl.Marker({
        //element: el, if I want a crosshair instead of the marker
        draggable: false,
        color: 'brown',
        scale: 0.8,
        })

        centerdot.setLngLat(map.getCenter())
        centerdot.addTo(map);

        map.on('move', function(e) {
          if (typeof centerdot !== 'undefined') {
            centerdot.setLngLat(map.getCenter());
          }
        });
    }
  }

  function addCrosshair(){
    if (mode !== "crosshair") {
    setDrawMode("crosshair");
    centerdot = new mapboxgl.Marker({
        //element: el, if I want a crosshair instead of the marker
        draggable: false,
        color: 'brown',
        scale: 0.8,
        })

        centerdot.setLngLat(map.getCenter())
        centerdot.addTo(map);

        map.on('move', function(e) {
          if (typeof centerdot !== 'undefined') {
            centerdot.setLngLat(map.getCenter());
          }
        });
        
    } else {
      setDrawMode("closed");
      centerdot.remove();
      delete centerdot;
    }
  }

  function AddMarker(e){
    poi = new POI(e);
    //Generate route when 2 or more markers are on screen
    if (AllMarkers.length > 1){
      AllMarkers[AllMarkers.length-1].calculateRoute(AllMarkers[AllMarkers.length-2],AllMarkers[AllMarkers.length-1]);
    }
    openCO2Box();
  }

  function UndoButtonClicked(marker){
    marker.undoLastMarker();
  }

  function POI(e){
      let marker = new mapboxgl.Marker({
        //This doesn't work and I don't understand why >> scale: 0.75, - https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker
        // element: el,
        draggable: true,
        color: 'grey',
        scale: 0.75,
      })
      if (mode == "drawing") {
        marker.setLngLat(e.lngLat);
      } 
      else if (mode == "crosshair") {
        marker.setLngLat(map.getCenter());
      } 
      else if (mode == "geolocate") {
        let templat = geolocate._lastKnownPosition.coords.latitude;
        let templng = geolocate._lastKnownPosition.coords.longitude;
        marker.setLngLat({"lng":templng, "lat":templat});
      }
      else if (mode == "searched") {
        marker.setLngLat(geocoder.mapMarker.getLngLat());
        geocoder.clear();
      } 
      marker.addTo(map);
      marker.id = AllMarkers.length;
      marker.CO2geojson = {};
      marker.geojson = {};
      //Every Layer and Source gets a Unique ID from a global Variable Counter that is always increasing
        marker.source = "source" + counter.toString();
        marker.layer = "layer" + counter.toString();
        counter++;

      marker.undoLastMarker = function(marker){
        marker.destoryMarkersRoute();
        marker.vaporizeMarker();
        // marker.recount();
      }

      marker.vaporizeMarker = function() {
        //Remove marker
        this.remove();
      } 
      marker.destoryMarkersRoute = function(){
        //M ----- M ------ M ------ M ------ M
        
        //M is the only Marker
        if (this.id == 0 && AllMarkers.length == 1) {
          return
        //There is no route to delete...
        //Sooo... Yea.... I guess... I don't need to write any code for here
        //Maybe write a short story about rocket ships of super intelligent dogs(?)  
        }
        //M is first Marker
        // M ------ is deleted
        else if (this.id == 0 && AllMarkers.length > 1) {
          AllMarkers[1].geojson = {};
          AllMarkers[1].CO2geojson = {};
          map.removeLayer(AllMarkers[1].layer);
          map.removeSource(AllMarkers[1].source);
        } 
        //M is last Marker
        // ------ M is deleted
        else if (this.id == AllMarkers.length - 1 && AllMarkers.length > 1) {
          //this is the last marker;
          map.removeLayer(this.layer);
          map.removeSource(this.source);
        }
        //M is a middle Marker
        //------ M ------ is deleted
        //M ---- - ---- M route is calculated
        else {
          map.removeLayer(this.layer);
          map.removeSource(this.source);
          map.removeLayer(AllMarkers[this.id+1].layer);
          map.removeSource(AllMarkers[this.id+1].source);
        }
      }
      marker.recount = function(){
          AllMarkers.splice(this.id,1) //Remove the approprate marker from the Array
          for (i = this.id; i<AllMarkers.length; i++){ //Re-number the marker id's and poi id's to match their position in the array  
             //This is because there is never a layer0/source0/geojson0. Layers are associated when there are at least *two* markers. 
              AllMarkers[i].id = i; //return the Markers to match
            }
      }      
      marker.redrawMarkerRoute = function(){
        //M ----- M ------ M ------ M ------ M
        //* is the only Marker - There is no route to redraw...
        let movedMarker = this;
        if (this.id == 0 && AllMarkers.length == 1) {
          return
        }
        //* is first Marker - Redraw M --^--- M ------ M
        else if (this.id == 0 && AllMarkers.length > 1) {
          AllMarkers[1].geojson = {};
          AllMarkers[1].CO2geojson = {};
          map.removeLayer(AllMarkers[1].layer);
          map.removeSource(AllMarkers[1].source);
          marker.calculateRoute(this,AllMarkers[this.id+1]);
        } 
        //M is last Marker - Redraw M ----- M --^-- M 
        else if (this.id == AllMarkers.length - 1 && AllMarkers.length > 1) {
          map.removeLayer(this.layer);
          map.removeSource(this.source);
          marker.calculateRoute(AllMarkers[this.id-1],this);         
        }
        //M is a middle Marker - Redraw Both M --^-- M --^-- M 
        else {
          map.removeLayer(this.layer);
          map.removeSource(this.source);
          map.removeLayer(AllMarkers[this.id+1].layer);
          map.removeSource(AllMarkers[this.id+1].source);
          marker.calculateRoute(AllMarkers[this.id-1],this);  
          marker.calculateRoute(this,AllMarkers[this.id+1]);       
        }
      }
      marker.calculateRoute = function(start, end){
          let CO2ghRouting = new GraphHopper.Routing(parametersCO2Car);
          delete CO2ghRouting.vehicle;

          CO2ghRouting.addPoint(new GHInput(start.getLngLat().lat, start.getLngLat().lng));
          CO2ghRouting.addPoint(new GHInput(end.getLngLat().lat, end.getLngLat().lng));
          CO2ghRouting.doRequest()
            .then(function(json) {
              // Add your own result handling here
              end.CO2geojson = json;
              CO2.Display();
            })
            .catch(function(err) {
              console.log("end: " + end);
              console.log("start: " + start);
              console.log("this: " + this);
              alert("An error may have occured! No big deal - but remember this is a pre-alpha release.\n\n Most likely the error occured on the server, and may be down. Or the point you picked is outside my calculated area of my mapped bike-routing area!\n\n If this continues please reach out to dylan.cobean@gmail.com");
              console.error(err.message);
            });

          let ghRouting = new GraphHopper.Routing(parameters);
          delete ghRouting.vehicle;

          ghRouting.addPoint(new GHInput(start.getLngLat().lat, start.getLngLat().lng));
          ghRouting.addPoint(new GHInput(end.getLngLat().lat, end.getLngLat().lng));
          ghRouting.doRequest()
            .then(function(json) {
              // Add your own result handling here
              end.geojson = json; //***This needs to be fixed. I shouldn't refer to the instance of the object, but the this.geojson doesn't work because this is currently referring to the window. 
              map.addSource(end.source, { type: 'geojson', data: end.geojson.paths[0].points });
              map.addLayer({
                "id": end.layer,
                "type": "line",
                "source": end.source,
                "paint": {
                  "line-color": "brown",//"#FF6600" //, //"#4f7ba4",
                  "line-opacity": 0.9,
                  "line-width": {
                      "type": "exponential",
                      "base": 1.5,
                      "stops": [
                          [0, 3.5 * Math.pow(2, (0 - 9))], //[0, baseWidth * Math.pow(2, (0 - baseZoom))],
                          [24, 3.5 * Math.pow(2, (24 - 18))] //[0, baseWidth * Math.pow(2, (0 - baseZoom))],
                      ]
                  }
                }
              });
            })
            .catch(function(err) {
              console.log("end: " + end);
              console.log("start: " + start);
              console.log("this: " + this);
              alert("Ahhh crap! Something went wrong! And now I need to fix whatever this is too.\n\n Most likely my bicycle-routing server is down, or the point you picked is outside my calculated area of my mapped bike-routing area!");
              console.error(err.message);
            });
      };
      marker.moved = function() {
        marker.redrawMarkerRoute();
        // if (marker.id !== 0 && marker.id !== AllMarkers.length-1) {
        //   // testFunction.call("apples","oranges");
        //   this.calculateRoute(AllMarkers[marker.id-1],marker);
        // }
        // if (marker.id !== 0 && marker.id !== AllMarkers.length-1) {
        //   marker.calculateRoute(AllMarkers[marker.id-1], AllMarkers[marker.id]); 
        //   marker.calculateRoute(AllMarkers[marker.id], AllMarkers[marker.id+1]);
        // }
        // else {
        //   alert("what else can go wrong?");
        // }
      }

      AllMarkers[AllMarkers.length] = marker;

      //Click behavior for marker 
      marker.getElement().addEventListener('click', function(e){
        // alert("marker number " + marker.id + " is about to go bye-bye");
        marker.destoryMarkersRoute();
        marker.vaporizeMarker();
        marker.recount();
        CO2.Display();
        if(marker.id !== 0 && marker.id !== AllMarkers.length){
          marker.calculateRoute(AllMarkers[marker.id-1], AllMarkers[marker.id]);
        }
        e.stopPropagation(); //Stop Propagation so that a new marker isn't added on click
      });

      //Drag behavior for marker
      marker.on('dragend', function(e){
        marker.moved();
      });
  }

  function Isochrone(){
    //Initialize a global variable that tracks if the Isochrone is active on screen. At the very start of the webpage loading, it is not active (false).
      IsochroneActive = false;

    //Methods

      //Isochrone Button Clicked
        this.IsochroneButtonClicked = function() {
          // alert("THIS keyword is coming next");
          // alert(this);
          this.ToggleIsochrone();
          if (IsochroneActive == true){
            this.generateIsochroneMarker();
            this.generateIsochronePolygon();
          }
          else if (IsochroneActive == false){
            this.removeIsochroneMarker();
            this.removeIsochronePolygon();
          }
        }

      //Generate a Isochrone Marker
        this.generateIsochroneMarker = function() {
          isoMarker = new mapboxgl.Marker({
            draggable: true,
            color: '#CF9A46',
            // scale: 0.75, - This doesn't work and I don't understand why - https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker
          });
          isoMarker.setLngLat(map.getCenter());
          isoMarker.addTo(map);
          isoMarker.on('dragend', myIsochrone.regenerate.bind(myIsochrone));
        }

      this.regenerate = function() {
        this.removeIsochronePolygon();
        this.generateIsochronePolygon();
      }

      this.generateIsochronePolygon = function() {
        if (IsochroneActive == true) {      
          var ghIsochrone = new GraphHopper.Isochrone({
          key: ghAPI, 
          host: myHostAddress, 
          vehicle: "bike"});
            var pointStr = isoMarker.getLngLat().lat + "," + isoMarker.getLngLat().lng // var pointStr = e.latlng.lat + "," + e.latlng.lng;
                ghIsochrone.doRequest({point: pointStr, buckets: 3, time_limit: 1000})
                    .then(function (json) {
                        ABC = json;
                        console.log(ABC);
                        map.addSource('maine0', {
                          'type': 'geojson',
                          'data': ABC.polygons[0]
                        });
                        map.addLayer({
                          'id': 'maine0',
                          'type': 'fill',
                          'source': 'maine0',
                          'layout': {},
                          'paint': {
                            'fill-color': '#088',
                            'fill-opacity': 0.4
                          }
                        });
                        map.addSource('maine1', {
                          'type': 'geojson',
                          'data': ABC.polygons[1]
                        });
                        map.addLayer({
                          'id': 'maine1',
                          'type': 'fill',
                          'source': 'maine1',
                          'layout': {},
                          'paint': {
                            'fill-color': '#058',
                            'fill-opacity': 0.4
                          }
                        });
                        map.addSource('maine2', {
                          'type': 'geojson',
                          'data': ABC.polygons[2]
                        });
                        map.addLayer({
                          'id': 'maine2',
                          'type': 'fill',
                          'source': 'maine2',
                          'layout': {},
                          'paint': {
                            'fill-color': '#028',
                            'fill-opacity': 0.4
                          }
                        });
                      })
                    .catch(function (err) {
                        $('#isochrone-response').text("An error occured: " + err.message);
                    });
                  }
        else if (IsochroneActive == false) {
          alert("i think i should delete this, this will only pop up if an error occurs.");
        }
      }

      this.removeIsochroneMarker = function() {
        isoMarker.remove();
      }

      this.ToggleIsochrone = function() {
        IsochroneActive = !IsochroneActive;
        // This is an alternative longer form version of my code above
        // if (IsochroneActive == false){
        //   IsochroneActive = true;
        // }
        // else {
        //   IsochroneActive = false;
        // }
      }

      this.removeIsochronePolygon = function () {
        map.removeLayer('maine0');
        map.removeSource('maine0');
        map.removeLayer('maine1');
        map.removeSource('maine1');
        map.removeLayer('maine2');
        map.removeSource('maine2');
      }
  }

  //Should this be inside the isochrone function? I think it might need to be... or maybe not, idk, see if I can find it on google, because i dont think i wrote this code, I think I copied it from example code online. 
    GraphHopperIsochrone = function (args) {
      this.time_limit = 2000;
      this.distance_limit = 0;
      this.buckets = 3;
      this.vehicle = "bike";
      this.point = [];
      this.host = "https://graphhopper.com/api/1";
      this.debug = false;
      this.basePath = '/isochrone';
      this.timeout = 30000;
      this.reverse_flow = false;

      ghUtil.copyProperties(args, this);
    };

    GraphHopperIsochrone.prototype.getParametersAsQueryString = function (args) {
        var qString = "point=" + args.point;
        qString += "&time_limit=" + args.time_limit;
        qString += "&distance_limit=" + args.distance_limit;
        qString += "&buckets=" + args.buckets;
        qString += "&vehicle=" + args.vehicle;
        qString += "&reverse_flow=" + args.reverse_flow;

        if (args.debug)
            qString += "&debug=true";

        return qString;
    };

    GraphHopperIsochrone.prototype.doRequest = function (reqArgs) {
        var that = this;

        return new Promise(function(resolve, reject) {
            var args = ghUtil.clone(that);
            if (reqArgs)
                args = ghUtil.copyProperties(reqArgs, args);

            var url = args.host + args.basePath + "?" + that.getParametersAsQueryString(args) + "&key=" + args.key;

            request
                .get(url)
                .accept('application/json')
                .timeout(args.timeout)
                .end(function (err, res) {
                    if (err || !res.ok) {
                        reject(ghUtil.extractError(res, url));
                    } else if (res) {
                        resolve(res.body);
                    }
                });
        });
    };

  //When the geocoder (i.e. the search bar) is engaged/triggered/used/etc... dropdown the Button for Generating Directions
    geocoder.on('result', function(e) {
      //geocoder.mapMarker.setPopup(new mapboxgl.Popup().setHTML("<h1>Hello World!</h1>")); // add popup
      document.getElementById("directionshere").classList.add("directionsbuttonvisible");
      document.getElementById("directionshere").innerHTML = "Get Route to " + geocoder._typeahead.selected.text;
    });

  //Specific Map Behavior
    map.on('click', function(e) {
      if (mode == "drawing") {
        AddMarker(e);
      }
    });

  function openCO2Box(){
    if (AllMarkers.length==2 && document.getElementById("CO2Box").classList.contains('displayCO2Box') == false) {
     $('#CO2Box').toggleClass('displayCO2Box');
    }
  }

  //Button Behavior
    document.getElementById("drawRoute").addEventListener("click", addCrosshair);
    document.getElementById("swapButton").addEventListener("click", function(){toggleDrawMode()});
    document.getElementById("dropCrosshairMarker").addEventListener("click", AddMarker);
    document.getElementById("undoCrosshairMarker").addEventListener("click", undoLastMarker);
    document.getElementById("directionshere").addEventListener("click", function(){Search.generateRoute()});
    document.getElementById("routerToggle").addEventListener("click", ToggleSafeRouting);
    // document.getElementById("cancelCrosshairMarker").addEventListener("click", function() { alert("IOU one function about canceling all routes")});
    // document.getElementById("isochroneButton").addEventListener("click", myIsochrone.IsochroneButtonClicked.bind(myIsochrone));
