var map, infoWindow, service, directionsService, directionsRenderer;

const placeList = document.getElementById("list");
function createMap(){
    var options = {
        center: {lat: 40.7678,lng:-73.9718},
        zoom: 16,
    };
    
    map = new google.maps.Map(document.getElementById('map'), options);
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    service = new google.maps.places.PlacesService(map);
    var input = document.getElementById('search');
    var searchBox = new google.maps.places.SearchBox(input);
    var button = document.getElementById('currentLocation');
    var request = {
        location: {lat: 40.7678,lng:-73.9718},
        radius: 800,
        keyword: 'restroom'
    };

    service.nearbySearch(request, callback);

    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });


    var markers = [];
    searchBox.addListener('places_changed', function () {
      var places = searchBox.getPlaces();
  
      if (places.length == 0)
        return;
  
      markers.forEach(function (m) { m.setMap(null); });
      markers = [];
  
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(p) {
        if (!p.geometry)
          return;
        service.nearbySearch({
            location: p.geometry.location,
            radius: 800,
            keyword: 'restroom '
        }, callback);
        markers.push(new google.maps.Marker({
          map: map,
          title: p.name,
          position: p.geometry.location
        }));
  
        if (p.geometry.viewport)
          bounds.union(p.geometry.viewport);
        else
          bounds.extend(p.geometry.location);
      });
      
      map.fitBounds(bounds);

    });

    infoWindow = new google.maps.InfoWindow;

    button.addEventListener("click", getCurrentLocation);
}

function handleLocationError(content, position){
    infoWindow.setPosition(position);
    infoWindow.setContent(content);
    infoWindow.open(map);
}

function callback(results, status){
    placeList.innerHTML= ``;
    if (status === google.maps.places.PlacesServiceStatus.OK){
        console.log("nearbySearch returned " + results.length + " results");
        for (var i = 0; i < results.length; i++){
            createMarker(results[i]);

            let locCard = document.createElement('div');
            locCard.id = "card";
            let content = document.createTextNode(results[i].name);
            locCard.appendChild(content);
            document.getElementById('list').appendChild(locCard);

            let locList = document.createElement('div');
            locList.id = "attributes";
            let br1 = document.createElement('br');
            let br2 = document.createElement('br');
            let br3 = document.createElement('br');
            let vicinity = document.createTextNode(results[i].vicinity);
            let businessStatus = document.createTextNode(results[i].business_status);
            var placeLoc = results[i].geometry.location;
            var distance = google.maps.geometry.spherical.computeDistanceBetween(placeLoc, map.center)
            let loc = document.createTextNode((distance/1000).toFixed(2)+" miles away");
            let dir = document.createTextNode("Get Directions");
            locList.appendChild(vicinity);
            locList.appendChild(br1);
            locList.appendChild(businessStatus);
            locList.appendChild(br2);
            locList.appendChild(loc);
            locList.appendChild(br3);
            document.getElementById('list').appendChild(locList);
            locList.style.display = 'none';
            locCard.style.backgroundColor = "white";
            locCard.addEventListener('click', function(){
                var displaySetting = locList.style.display;
                if (displaySetting == 'block'){
                    locList.style.display = 'none';
                    locCard.style.backgroundColor = "white";
                    
                }
                else{
                    locList.style.display = 'block';
                    locCard.style.backgroundColor = "#c0e9fb";
                }
            }, false);

        }
    }
}

function createMarker(place){
    var orig = map.center;
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: placeLoc
    });
    google.maps.event.addListener(marker, 'click', function(){
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
        navigate(orig, placeLoc);
    });
}

function navigate(orig, placeLoc){
    var req = {
        origin: orig,
        destination: placeLoc,
        travelMode: google.maps.TravelMode.WALKING
    }
    directionsRenderer.setMap(map);
    directionsService.route(req, function(response, status) {
        if (status == 'OK') {
          directionsRenderer.setDirections(response);
        }
      });
}

function getCurrentLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function (p){
            var position={
                lat: p.coords.latitude,
                lng : p.coords.longitude
            };
            map.setCenter(position);
            infoWindow.setPosition(position);
            infoWindow.setContent("Your location");
            infoWindow.open(map);
            service.nearbySearch({
                location: position,
                radius: 800,
                keyword: 'restroom'
            }, callback);
        }, function(){
            handleLocationError(map.center);
        })
    }else{
        handleLocationError("No geolocation available.", map.center);
    }
}
