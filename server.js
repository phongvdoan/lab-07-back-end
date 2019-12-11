'use strict';
//DEPENDENCIES
const PORT = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(cors());

// GLOBAL VARIABLES
let error = {
  status: 500,
  responseText: "Sorry, something went wrong",
}

// LOCATION PATH
app.get('/location', (request, response) => {
  const geoData = require('./data/geo.json');
  let query = request.query['data'].toLowerCase();
  const location = geoData.results[0].geometry.location;
  const formAddr = geoData.results[0].formatted_address;
  console.log('formAddr :', formAddr);
  const searchquery = geoData.results[0].address_components[0].short_name.toLowerCase();
  if (query !== searchquery) {
    response.send(error);
    console.log(error);
    return null;
  }
  response.send(new Geolocation (searchquery, formAddr, location));
});
// LOCATION CONSTRUCTOR FUNCTION
function Geolocation (searchquery,formAddr,location) {
  this.searchquery = searchquery;
  this.formatted_query = formAddr;
  this.latitude = location['lat'];
  this.longitude = location['lng'];
}
// WEATHER PATH
app.get('/weather', (request , response ) => {
  const reply = [];
  const weatherData = require('./data/darksky.json');
  const weatherArr = weatherData.daily.data
  for (let i = 0; i < weatherArr.length; i++) {
    reply.push(new Forecast (weatherArr[i].summary, weatherArr[i].time));
  }
  response.send( reply );
})
// FORECAST CONSTRUCTOR FUNCTION
function Forecast (summary, time) {
  this.forecast = summary;
  this.time = (new Date(time * 1000)).toDateString();
}

app.listen(PORT, () => {
  console.log(`App is on PORT: ${PORT}`);
});
