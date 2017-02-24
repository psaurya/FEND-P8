/*re-render markers in display on screen resize*/
window.onresize = function() {
  if (typeof google !== "undefined") {
    initMap();
  }
};
/*Add classes to toggle hamburger sign and list*/

var hamburger;

function toggleSign(x) {
  hamburger = x; //capture hamburger on click
  x.classList.toggle("change");
  $(".list").toggleClass("visible");
}

function toggleClass() {
  if ($(window).width() < 850) {
    hamburger.classList.toggle("change");
    $(".list").toggleClass("visible");
  }
}

/*Trigger this function if Google Maps api didn't load properly*/

function errorLog() {
  console.log("Google Maps didn't load properly");
  alert("OOps! something went wrong");
}
/*data to be used*/
var locations = [{
  title: "Dudhwa National Park",
  location: {
    lat: 28.5401707,
    lng: 80.6140769
  },
  weather: "Fetching data...",
  id: 0
}, {
  title: "IIT Kanpur",
  location: {
    lat: 26.5123388,
    lng: 80.2329
  },
  weather: "Fetching data...",
  id: 1
}, {
  title: "Fort Rampura",
  location: {
    lat: 26.3430947,
    lng: 79.1760863
  },
  weather: "Fetching data...",
  id: 2
}, {
  title: "Bara Imambara",
  location: {
    lat: 26.8690138,
    lng: 80.9130621
  },
  weather: "Fetching data...",
  id: 3
}, {
  title: "Taj Mahal",
  location: {
    lat: 27.1729674,
    lng: 78.0399184
  },
  weather: "Fetching data...",
  id: 4
}];

/*OpenWeather API call*/
/* A getJSON request for to fetch data at each point*/
for (var i = 0; i < locations.length; i++) {
  var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + locations[i].location.lat + "&lon=" + locations[i].location.lng + "&appid=baa5e929cc61831f0ccf7b9732b6d1c2";
  /*An IIFE to pass i to .getJSON*/
  /*IIFE captures current i for .getJSON result events*/
  (function(i) {
    $.getJSON(url)
      .done(function(data) {

        var weather = data.weather[0].description.toUpperCase();
        var temp = data.main.temp - 273;
        temp = temp.toFixed(2);
        locations[i].weather = weather + "<br>" + temp.toString() + "&deg;C";

      }).fail(function() {
        locations[i].weather = "Winter is Coming!";
        console.log("Couldn't load openweather API");
      });
  })(i);

}

var map;

var markers;

var infoWindow;

/*runs as soon as google Maps API loads*/

function initMap() {

  markers = [];
  /*generate map */
  map = new google.maps.Map(document.getElementById('map'), {
    center: locations[1].location,
    zoom: 6,
    mapTypeControl: false
  });
  /*save all the markers in markers array*/
  var largeInfowindow = new google.maps.InfoWindow();
  infoWindow = largeInfowindow;
  for (var i = 0; i < locations.length; i++) {
    var marker = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      weather: locations[i].weather,
      animation: google.maps.Animation.DROP,
      id: locations[i].id
    });
    markers.push(marker);
    marker.addListener('click', function() {
      bounceIt(this);
      populateInfoWindow(this, largeInfowindow);
    });
  }
  //loop through markers to define bounds of Map
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }

}
//populate marker with infowindow
function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + "<br>" + locations[marker.id].weather + '</div>');
    infowindow.open(map, marker);
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  }
}
//make marker bounce for 2 secs
function bounceIt(marker) {
  marker.setAnimation(google.maps.Animation.BOUNCE);
  window.setTimeout(function() {
    marker.setAnimation(null);
  }, 2000);
}
//////////////ViewModel
function ViewModel() {
  var self = this;
  self.data = ko.observableArray(locations);
  self.search = ko.observable("");
  /*currentLoc is the list which gets displayed*/
  /*it gets updated on each update*/
  self.currentLoc = ko.computed(function() {
    if (self.search() === "") {
      /*at no input make each marker visible*/
      if (typeof google !== "undefined") {
        for (var i = 0; i < self.data().length; i++) {
          markers[i].setMap(map);
        }
      }
      /*return whole data if no input*/
      return self.data();
    }
    /*make a blank array. It'll be returned back*/
    var loc = [];
    /*filter non-matching strings and markers*/
    for (var i = 0; i < self.data().length; i++) {
      if (typeof google !== "undefined") {
        markers[i].setMap(null);
        //hide marker initially
      }
      //capitalize strings during match to make them case-insensitive
      if ((self.data()[i].title).toUpperCase().indexOf(self.search().toUpperCase()) !== -1) {
        loc.push(self.data()[i]);
        if (typeof google !== "undefined") {
          markers[i].setMap(map);
          //display if string match found
        }
      }
    }
    //return filtered array
    return loc;
  });
  //bounce marker and populate its infoWindow
  //trigger it with click on the list name
  self.bounce = function() {
    //'this' is local. Bound with triggering object
    //An element of currentLoc in this case
    bounceIt(markers[this.id]);
    if (typeof google !== "undefined") {
      populateInfoWindow(markers[this.id], infoWindow);
    }
  };
}
//apply knockout bindings
ko.applyBindings(new ViewModel());