window.addEventListener("load", doEverything());//switch to everythingfunction2 when ready to make the leap to the cleaner code

function doEverything(){
  illCleanThisFunctionUpLater();
  // OOP();
  //all my other code here
}

// function OOP(){
  let parametersGHsafe = {
    host: "http://localhost:8989", //host: "http://localhost:8989",
    profile: "pathways_v2", // "car_co2", "bike_canturn", "pathways_v2"
    //vehicle: "bike",
    //weighting: "shortest", //weighting: "custom",
    //turn_costs: false, //turn_costs: true, DOES NOT LIKE THIS PARAMETER IN CURRENT GRAPH ITTERATION
    
    //profile: "pathways",
    // profile: "pathways_v2",
    // elevation: false,
    // turn_costs: true,
    details: ["road_class", "distance"]
  }

  let parametersGHdangerous = {
    host: "http://localhost:8989",
    profile: "bike_canturn", //"car_co2", "bike_canturn", "pathways_v2"
    //weighting: "fastest",
    //turn_costs: false, //turn_costs: true, DOES NOT LIKE THIS PARAMETER IN CURRENT GRAPH ITTERATION
    
    // key: API.graphhopper,
    // vehicle: "car",
    // elevation: false,
    details: ["road_class", "distance"]
  }

  let parameters = parametersGHsafe;

  let carbon = 0;
  let myPOI = new POI();
  let AllPOIs = new AllPOIsconstructor();
  let myRoute = new Route();
  let counter = 0;
  let myIsochrone = new Isochrone();
  let crosshair = new MobileMarkers();

  // var request = require('superagent');
  // var Promise = require("bluebird");
  // var GHUtil = require("./../../js/GHUtil");
  // var ghUtil = new GHUtil();

  function AllPOIsconstructor(){}; //Empty Constructor to hold the AllPOIs 

  function POI(){
    
    //Method
    this.onDragEnd = function () {
      // alert('I just dragged marker-'+this.id+'.');
      let marker = this;
      let currentMarkerPosition = Object.keys(AllPOIs).indexOf(marker.id.toString());
      let subsequentMarkerPosition = currentMarkerPosition + 1;
      let priorMarkerPosition = currentMarkerPosition - 1;
      let nextmarker = AllPOIs[Object.keys(AllPOIs)[subsequentMarkerPosition]];
      let priormarker = AllPOIs[Object.keys(AllPOIs)[priorMarkerPosition]];
        if (currentMarkerPosition == 0) {
          //Marker is first marker, and doesn't have a layer assigned to it. The mext marker (nextid) does.
            let nextmarker = AllPOIs[Object.keys(AllPOIs)[subsequentMarkerPosition]];
            map.removeLayer(nextmarker.layer);
            map.removeSource(nextmarker.source);
            delete myRoute.geojson[nextmarker.id];
            myRoute.calculateGHArray(marker,nextmarker);
        }
        else if (currentMarkerPosition == Object.keys(AllPOIs).length-1) {
          //Marker is last marker, and there is no subsequent marker (ie no nextid) 
            let priormarker = AllPOIs[Object.keys(AllPOIs)[priorMarkerPosition]];
            map.removeLayer(marker.layer);
            map.removeSource(marker.source);
            delete myRoute.geojson[marker.id];
            myRoute.calculateGHArray(priormarker,marker);
        }
        else {
          //Marker is a "bridge marker" and has a marker before and after it.
            let nextmarker = AllPOIs[Object.keys(AllPOIs)[subsequentMarkerPosition]];
            let priormarker = AllPOIs[Object.keys(AllPOIs)[priorMarkerPosition]];
            map.removeLayer(marker.layer);
            map.removeSource(marker.source);
            map.removeLayer(nextmarker.layer);
            map.removeSource(nextmarker.source);
            delete myRoute.geojson[marker.id];
            myRoute.calculateGHArray(priormarker,marker);
            myRoute.calculateGHArray(marker,nextmarker);
        }
    }

    this.Delete = function(_marker) {
      let id = _marker.id;
      delete AllPOIs[id];
    }

    this.GetPosition = function () {
    }

    this.PriorMarker = function(_marker) {
      let id = _marker.id;
      let currentMarkerPosition = Object.keys(AllPOIs).indexOf(id.toString()); //Find where the unique ID of the current marker, occurs in the ALLPOIs list
      let priorMarkerPosition = currentMarkerPosition - 1; //Move one prior from that current marker
      let priorid = Object.keys(AllPOIs)[priorMarkerPosition];
      return AllPOIs[priorid]; //Return that Marker Object
    }

    this.SubsequentMarker = function (_marker) {
      let id = _marker.id;
      let currentMarkerPosition = Object.keys(AllPOIs).indexOf(id.toString()); //Find where the unique ID of the current marker, occurs in the ALLPOIs list
      let subsequentMarkerPosition = currentMarkerPosition + 1; //Move one prior from that current marker
      let subsequentid = Object.keys(AllPOIs)[subsequentMarkerPosition];
      return AllPOIs[subsequentid]; //Return that Marker Object
    }

    this.AddPOI = function(e){
      let marker = new mapboxgl.Marker({
        //This doesn't work and I don't understand why >> scale: 0.75, - https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker
        // element: el,
        draggable: true,
        color: 'grey',
        scale: 0.75,
      })
      marker.setLngLat(e.lngLat);
      marker.addTo(map);
      marker.id = counter;
      marker.source = "source" + marker.id.toString();
      marker.layer = "layer" + marker.id.toString();
      AllPOIs[counter] = marker;
      counter++;
      if (Object.keys(AllPOIs).length >= 2) {
        let startPOI = myPOI.PriorMarker(marker);
        myRoute.calculateGHArray(startPOI, marker);
      }
      //     If I would like to have marker delete be held inside of a popup use this code         marker.setPopup(new mapboxgl.Popup().setHTML("<h6>Undo</h6>"))
      //     If I would like to have marker delete be held inside of a popup use this code         marker.togglePopup(); // toggle popup open or closed


      //give the markers behavior for being dragged
        marker.on('dragend', myPOI.onDragEnd);

      //give the markers behavior for being dragged
        marker.getElement().addEventListener('click', function(e){
          let id = marker.id;
          let markerPosition = Object.keys(AllPOIs).indexOf(id.toString());
          let numberOfPOIs = Object.keys(AllPOIs).length - 1;
          if (markerPosition == 0 && numberOfPOIs == 0){
            myPOI.Delete(marker);
            e.stopPropagation();
          }
          else if (0 < markerPosition && markerPosition < numberOfPOIs) {
            let startPOI = myPOI.PriorMarker(marker);
            let endPOI = myPOI.SubsequentMarker(marker);
            myRoute.RemoveRoute(marker);
            myPOI.Delete(marker);
            myRoute.calculateGHArray(startPOI, endPOI);
            e.stopPropagation();
          }
          else if (markerPosition == 0 && markerPosition != numberOfPOIs) {
            let nextid = myPOI.SubsequentMarker(marker);
            myRoute.RemoveRoute(marker);
            myPOI.Delete(marker);
            e.stopPropagation();
          }
          else if (markerPosition == numberOfPOIs) {
            myRoute.RemoveRoute(marker);
            myPOI.Delete(marker);
            e.stopPropagation();
          }
          else {
            alert("somehow you clicked something that broke something... I say just refresh the page and start over =P");                           //Stop all other code, ie, stop map.on("click") from trying to put down a new marker
          }
          myPOI.Delete(this);
          marker.remove();
          delete AllPOIs[marker.id];                           //remove marker
          CO2.Display();
          e.stopPropagation();                                //Stop all other code, ie, stop map.on("click") from trying to put down a new marker
      });
    }
  } //end POI Constructor

  function Route(){
    //Parameters
      this.markAs = '';
      this.POIs = {}; 
      this.startPoint = this.POIs[0]; 
      this.endPoint = this.POIs[this.POIs.length-1];
      this.geojson = {}
      this.safe = true;

    //Methods
      this.calculateGHArray = function(_startPOI, _endPOI){
        let startPOI = _startPOI;
        let endPOI = _endPOI;
        let ghRouting = new GraphHopper.Routing(parameters);
        delete ghRouting.vehicle;

        ghRouting.addPoint(new GHInput(startPOI.getLngLat().lat, startPOI.getLngLat().lng));
        ghRouting.addPoint(new GHInput(endPOI.getLngLat().lat, endPOI.getLngLat().lng));
        ghRouting.doRequest()
          .then(function(json) {
            // Add your own result handling here
            AllPOIs[endPOI.id].geojson = json; //***This needs to be fixed. I shouldn't refer to the instance of the object, but the this.geojson doesn't work because this is currently referring to the window. 
            myRoute.showOnMap(endPOI);
            CO2.Display();
          })
          .catch(function(err) {
            alert("Ahhh crap! Something went wrong! And now I need to fix whatever this is too.\n\n Most likely my bicycle-routing server is down, or the point you picked is outside my calculated area of my mapped bike-routing area!");
            console.error(err.message);
          });
      };

      this.showOnMap = function(_marker){
        let marker = _marker;
        map.addSource(marker.source, { type: 'geojson', data: AllPOIs[marker.id].geojson.paths[0].points });
        map.addLayer({
          "id": marker.layer,
          "type": "line",
          "source": marker.source,
          "paint": {
            "line-color": "brown",//"#FF6600" //, //"#4f7ba4",
            "line-opacity": 0.75,
            "line-width": 3
          }
        });
      }

      this.RemoveRoute = function(_marker) {
        let marker = AllPOIs[_marker.id];
        let currentMarkerPosition = Object.keys(AllPOIs).indexOf(marker.id.toString());
        let subsequentMarkerPosition = currentMarkerPosition + 1;
        let nextmarker = AllPOIs[Object.keys(AllPOIs)[subsequentMarkerPosition]];  
        if (currentMarkerPosition == 0) {
          //Marker is first marker, and doesn't have a layer assigned to it. The mext marker (nextid) does.
            delete myRoute.geojson[marker.id];
            map.removeLayer(nextmarker.layer);
            map.removeSource(nextmarker.source);
        }
        else if (currentMarkerPosition == Object.keys(AllPOIs).length-1) {
          //Marker is last marker, and there is no subsequent marker (ie no nextid) 
            delete myRoute.geojson[marker.id];
            let subsequentMarkerPosition = currentMarkerPosition + 1;
            let nextid = Object.keys(AllPOIs)[subsequentMarkerPosition];
            map.removeLayer(marker.layer);
            map.removeSource(marker.source);
        }
        else {
          //Marker is a "bridge marker" and has a marker before and after it.
            delete myRoute.geojson[marker.id];
            let subsequentMarkerPosition = currentMarkerPosition + 1;
            let nextid = Object.keys(AllPOIs)[subsequentMarkerPosition];
            map.removeLayer(marker.layer);
            map.removeSource(marker.source);
            map.removeLayer(nextmarker.layer);
            map.removeSource(nextmarker.source);
        }
      }

      this.zoomToRoute = function(){
        let boundary = []
        boundary[0] = this.geojson.paths[0].bbox[0] - 0.008;
        boundary[1] = this.geojson.paths[0].bbox[1] - 0.008;
        boundary[2] = this.geojson.paths[0].bbox[2] + 0.008;
        boundary[3] = this.geojson.paths[0].bbox[3] + 0.008;
        map.fitBounds(boundary);
      }

      this.ToggleSafeRouting = function(){
        if (myRoute.safe == true) {
          myRoute.safe = false;
        }
        else {
          myRoute.safe = true;
        }
        if (myRoute.safe == true) {
          myRoute.ClearAllRoutes();
          parameters = parametersGHsafe;
          myRoute.RouteAll();
        }
        else if (myRoute.safe == false) {
          myRoute.ClearAllRoutes();
          parameters = parametersGHdangerous;
          myRoute.RouteAll();
        }
      } 

      this.ClearAllMarkers = function(){
        let allPOIvalues = Object.values(AllPOIs);
        for (i = 0; i < allPOIvalues.length; i++ ) {
          crosshair.undoLastMarker();
        } 
      }

      this.RouteAll = function(){
        let allPOIvalues = Object.values(AllPOIs);
        for (i = 0; i < allPOIvalues.length-1; i++ ) {
          myRoute.calculateGHArray(AllPOIs[i],AllPOIs[i+1])
        } 
      }

      this.ClearAllRoutes = function(){
        let allPOIvalues = Object.values(AllPOIs);
        for (i = 1; i < allPOIvalues.length; i++ ) {
          map.removeLayer(AllPOIs[i].layer);
          map.removeSource(AllPOIs[i].source);
        } 
      }
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


  function MobileMarkers() {
    this.ToggleCrosshair = function(){
      //If I want a crosshair instead of the Marker
      // create a HTML element for each feature
      // var el = document.createElement('div');
      // el.className = 'crosshair';
      if (typeof centerdot !== 'undefined') {
        centerdot.remove();
        delete centerdot;
      }
      else {
        centerdot = new mapboxgl.Marker({
        //element: el, if I want a crosshair instead of the marker
        draggable: false,
        color: 'brown',
        scale: 0.8,
        })

        centerdot.setLngLat(map.getCenter())
        centerdot.addTo(map);

        map.on('move', function(e) {
          if (typeof centerdot != 'undefined') {
            centerdot.setLngLat(map.getCenter());
          }
        });
      }
      
    }

    this.DropCrosshairMarker = function(){
      map.on('click', function() {
        let marker = new mapboxgl.Marker({
          draggable: true,
          color: 'blue',
        })

        marker.setLngLat(map.getCenter())
        marker.addTo(map);
      });

    }
    this.AddMarker = function(e){
      let marker = new mapboxgl.Marker({
        //This doesn't work and I don't understand why >> scale: 0.75, - https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker
        // element: el,
        draggable: true,
        color: 'grey',
        scale: 0.9,
      })
      marker.setLngLat(map.getCenter());
      marker.addTo(map);
      marker.id = counter;
      marker.source = "source" + marker.id.toString();
      marker.layer = "layer" + marker.id.toString();
      AllPOIs[counter] = marker;
      counter++;
      if (Object.keys(AllPOIs).length >= 2) {
        let startPOI = myPOI.PriorMarker(marker);
        myRoute.calculateGHArray(startPOI, marker);
      }
      //     If I would like to have marker delete be held inside of a popup use this code         marker.setPopup(new mapboxgl.Popup().setHTML("<h6>Undo</h6>"))
      //     If I would like to have marker delete be held inside of a popup use this code         marker.togglePopup(); // toggle popup open or closed


      //give the markers behavior for being dragged
        marker.on('dragend', myPOI.onDragEnd);

      //give the markers behavior for being dragged
        marker.getElement().addEventListener('click', function(e){
          let id = marker.id;
          let markerPosition = Object.keys(AllPOIs).indexOf(id.toString());
          let numberOfPOIs = Object.keys(AllPOIs).length - 1;
          if (markerPosition == 0 && numberOfPOIs == 0){
            myPOI.Delete(marker);
            e.stopPropagation();
          }
          else if (0 < markerPosition && markerPosition < numberOfPOIs) {
            let startPOI = myPOI.PriorMarker(marker);
            let endPOI = myPOI.SubsequentMarker(marker);
            myRoute.RemoveRoute(marker);
            myPOI.Delete(marker);
            myRoute.calculateGHArray(startPOI, endPOI);
            e.stopPropagation();
          }
          else if (markerPosition == 0 && markerPosition != numberOfPOIs) {
            let nextid = myPOI.SubsequentMarker(marker);
            myRoute.RemoveRoute(marker);
            myPOI.Delete(marker);
            e.stopPropagation();
          }
          else if (markerPosition == numberOfPOIs) {
            myRoute.RemoveRoute(marker);
            myPOI.Delete(marker);
            e.stopPropagation();
          }
          else {
            alert("somehow you clicked something that broke something... I say just refresh the page and start over =P");                           //Stop all other code, ie, stop map.on("click") from trying to put down a new marker
          }
          myPOI.Delete(this);
          marker.remove();
          delete AllPOIs[marker.id];                           //remove marker
          e.stopPropagation();                                //Stop all other code, ie, stop map.on("click") from trying to put down a new marker
      });
    }

  this.undoLastMarker = function(){
      let numberofPOIs = Object.keys(AllPOIs).length - 1;
      let lastmarkeridstring = Object.keys(AllPOIs)[numberofPOIs];
      let lastmarker = AllPOIs[Number(lastmarkeridstring)];
      if (Object.keys(AllPOIs).length == 1) {
        myPOI.Delete(lastmarker);
        lastmarker.remove()
        CO2.Display();
      }
      else if (Object.keys(AllPOIs).length != 1) {
        myRoute.RemoveRoute(lastmarker);
        myPOI.Delete(lastmarker);
        lastmarker.remove();
        CO2.Display();
      }
    }
  }

  //Button Functionality
    let CO2 = {
      Measure: function (_AllPOIs) {
        let AllPOIs = _AllPOIs;
        let AllPOIsValues = Object.values(AllPOIs);
        let sum = 0;

        for (i = 1; i < AllPOIsValues.length; i++) {
          let distanceMiles = AllPOIsValues[i].geojson.paths[0].distance/5280;
          let yourCarMPG = 25;
          let poundsCO2ProducedPerGallonOfGas = 20;
          let LbsofCO2 = distanceMiles * yourCarMPG / poundsCO2ProducedPerGallonOfGas;
          sum = Math.round((sum + LbsofCO2)*100)/100;
        }
        return sum;
      },
      Display: function() {
        // alert(CO2.Measure(AllPOIs));      
        document.getElementById("offsetinsert").innerHTML = CO2.Measure(AllPOIs);
        document.getElementById("offsetunits").innerHTML = " lbs CO2";
        document.getElementById("offsettext").innerHTML = "Offset from Atmosphere";
      }
    }

    let Search = {
      generateRoute: function(){
        geolocate._geolocateButton.click();
        geolocate.on('geolocate', function(e) {
              // var lon = e.coords.longitude;
              // var lat = e.coords.latitude
              // var position = [lon, lat];
              let startPOI = geolocate._accuracyCircleMarker;
              //let startPOI = AllPOIs[0];
              let endPOI = geocoder.mapMarker;
              endPOI.id = 1;
              endPOI.source = "source" + endPOI.id.toString();
              endPOI.layer = "layer" + endPOI.id.toString();
              AllPOIs[1] = endPOI;
              myRoute.calculateGHArray(startPOI,endPOI);
        });
      }
    }


  //Add a marker on mouse click, and create a route if two or more markers exist
    map.on('click', function(e) {
      myPOI.AddPOI(e);
    });

  //Add Button Behavior for Crosshair Routing
    document.getElementById("drawRoute").addEventListener("click", crosshair.ToggleCrosshair);
    document.getElementById("dropCrosshairMarker").addEventListener("click", crosshair.AddMarker);
    document.getElementById("undoCrosshairMarker").addEventListener("click", crosshair.undoLastMarker);
    document.getElementById("cancelCrosshairMarker").addEventListener("click", function() { myRoute.ClearAllMarkers;crosshair.ToggleCrosshair();});
    // document.getElementById("isochroneButton").addEventListener("click", myIsochrone.IsochroneButtonClicked.bind(myIsochrone));
    document.getElementById("routerToggle").addEventListener("click", myRoute.ToggleSafeRouting);
    document.getElementById("directionshere").addEventListener("click", Search.generateRoute);


    $(function() {
        $('#routerToggle').change(function() {
          myRoute.ToggleSafeRouting();
        });
      });

    //When the geocoder (i.e. the search bar) is engaged/triggered/used/etc... dropdown the Button for Generating Directions
    geocoder.on('result', function(e) {
      //geocoder.mapMarker.setPopup(new mapboxgl.Popup().setHTML("<h1>Hello World!</h1>")); // add popup
      document.getElementById("directionshere").classList.add("directionsbuttonvisible");
      document.getElementById("directionshere").innerHTML = "Get Route to " + geocoder._typeahead.selected.text;
    });
