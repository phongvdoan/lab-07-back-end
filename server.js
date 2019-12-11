'use strict';
//DEPENDENCIES
const PORT = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(cors());
const superagent = require('superagent');

// GLOBAL VARIABLES
let error = {
  status: 500,
  responseText: "Sorry, something went wrong",
}
const GEOCODE_API_KEY = process.env.geocode_api;
console.log('GEOCODE_API_KEY :', GEOCODE_API_KEY);

// LOCATION PATH
app.get('/location', (request, res) => {
  let query = request.query.data;

  superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GEOCODE_API_KEY}`).then(response => {
    const location = response.body.results[0].geometry.location;
    const formAddr = response.body.results[0].formatted_address;
    const searchquery = response.body.results[0].address_components[0].long_name.toLowerCase();
    if (query !== searchquery) {
      response.send(error);
      console.log(error);
      return null;
    }
    res.send(new Geolocation(searchquery, formAddr, location));
  })

});
// LOCATION CONSTRUCTOR FUNCTION
function Geolocation(searchquery, formAddr, location) {
  this.searchquery = searchquery;
  this.formatted_query = formAddr;
  this.latitude = location['lat'];
  this.longitude = location['lng'];
}
// WEATHER PATH
app.get('/weather', (request, response) => {
  const weatherData = require('./data/darksky.json');
  const weatherArr = weatherData.daily.data
  const reply = weatherArr.map(byDay => {
    return new Forecast(byDay.summary, byDay.time);
  })
  response.send(reply);
})
// FORECAST CONSTRUCTOR FUNCTION
function Forecast(summary, time) {
  this.forecast = summary;
  this.time = (new Date(time * 1000)).toDateString();
}

app.listen(PORT, () => {
  console.log(`App is on PORT: ${PORT}`);
});
