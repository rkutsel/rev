//Define Global properties

let jsonData;
let userInputGeoId;
let cityCoordinates = [];
let autoComplete = {};
let chargeMapPoi = {};

//Event Listeners
const userInputEl = document.getElementById("autocomplete-input");
const userButtonEl = document.getElementById("search-btn");
userButtonEl.addEventListener("click", captureUserInput);

function captureUserInput(event) {
  const mapEl = document.getElementById("map");
  mapEl.removeAttribute("id");
  const mapContainer = document.getElementById("leaflet");
  mapDiv = document.createElement("div");
  mapDiv.setAttribute("id", "map");
  mapContainer.appendChild(mapDiv);
  const userInput = event.target;
  const inputVal = userInputEl.value;
  if (!inputVal || inputVal < 3) {
    return;
  } else {
    const inputMatch = inputVal.split(",");
    console.log(inputMatch);
    findCityMatch(inputMatch[0], inputMatch[1]);
    setTimeout(loadMap, 2000);
  }
}

function loadMap() {
  const lat = findCityCoordinates()[0];
  const lon = findCityCoordinates()[1];

  let map = L.map("map").setView([lat, lon], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map);

  // show the scale bar on the lower left corner
  L.control.scale({ imperial: true, metric: true }).addTo(map);

  for (i in chargeMapPoi) {
    L.marker([
      chargeMapPoi[i].AddressInfo.Latitude,
      chargeMapPoi[i].AddressInfo.Longitude,
    ])
      .bindPopup(chargeMapPoi[i].AddressInfo.Title)
      .addTo(map);
    console.log(chargeMapPoi[i].AddressInfo.Latitude);
  }
}

//pre-load city coordinates
function loadGeoData() {
  fetch("./assets/js/cities.json")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        autoComplete[`${data[i].city}, ${data[i].state}`] = null;
      }
      jsonData = data;
      getUserLocation();
    });
}

//Open Charge Map Calls
function getChargingStations(lat, lon, max = "5") {
  console.log(lat, lon);
  let poiCallUrl = "https://api.openchargemap.io/v3/poi?key=mykey&output=json&";
  let maxResults = "maxresults=" + max + "&";
  let latitude = "latitude=" + lat.toString() + "&";
  let longitude = "longitude=" + lon.toString();
  let requiredUrl = poiCallUrl + maxResults + latitude + longitude;
  console.log(requiredUrl);
  fetch(requiredUrl)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      chargeMapPoi = data;
    });
}

//Get user location on initial page load
function getUserLocation() {
  const geoLocation = fetch("https://ipapi.co/json")
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        findCityMatch();
      }
    })
    .then((data) => {
      findCityMatch(data.city);

      console.log(
        "Your current location is",
        data.city,
        "\n",
        "*******************************"
      );
    })
    .catch((error) => {
      findCityMatch();
    });
}

//Find a match for City && State. NOTE: ADD 2 ARGS FOR EVENT LISTENERS
function findCityMatch(city = "Portland", state = "Oregon") {
  // console.log(city);
  let cityMatch = jsonData.find((cityId) => cityId.city === city);
  let stateMatch = jsonData.find((stateId) => stateId.state === state);

  if (cityMatch || (cityMatch && stateMatch)) {
    userInputGeoId = jsonData.indexOf(cityMatch);
    findCityCoordinates();
    return console.log(
      "Found a match!",
      jsonData.indexOf(cityMatch),
      cityMatch.city,
      // stateMatch.state,
      "\n",
      "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
    );
  } else {
    return console.log(`Could not find ${cityMatch.city}, ${stateMatch.state}`);
  }
}

//Find and return an array that holds city coordinates

function findCityCoordinates() {
  let coordinates = [];
  coordinates.push(jsonData[userInputGeoId].latitude);
  coordinates.push(jsonData[userInputGeoId].longitude);
  console.log(
    "Your city coordinates are: \n",
    "Latitude:",
    coordinates[0],
    "Longitude",
    coordinates[1],
    "\n",
    "============================================="
  );
  getChargingStations(coordinates[0], coordinates[1], "6");
  return coordinates;
}

function getAutoComplete() {
  document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.querySelectorAll(".autocomplete");
    M.Autocomplete.init(inputField, {
      data: autoComplete,
      limit: 5,
      minLength: 3,
    });
  });
}

function errorMessage() {
	let error = document.getElementById("invalidInput")
	if 
}

//Init the app
function initApp() {
  loadGeoData();
  setTimeout(loadMap, 2000);
  getAutoComplete();
}

initApp();
