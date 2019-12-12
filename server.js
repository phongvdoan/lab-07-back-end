'use strict';
//DEPENDENCIES
const PORT = process.env.PORT || 3000;
const pg = require('pg');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
app.use(cors());
const superagent = require('superagent');

// GLOBAL VARIABLES
let error = {
  status: 500,
  responseText: 'Sorry, something went wrong',
}
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
let locationSubmitted;

// CONNECT TO SQL
const client = new pg.Client(`${DATABASE_URL}`);
client.on('error', error => console.error(error));
client.connect();
// GET INFO FROM SQL DATABASE
// app.get('/', (req, res) => {
//   const SQL = 'SELECT * FROM location;';
//   client.query(SQL).then(sqlResponse => {
//     console.log(sqlResponse);
//     res.send(sqlResponse.rows);
//   });
// });

// LOCATION PATH
app.get('/location', (request, res) => {
  let query = request.query.data.toLowerCase();
  let SQL = `SELECT * FROM location`;
  client.query(SQL).then( sqlResponse => {
    for (let i = 0; i < sqlResponse.rows.length; i++) {
      console.log(sqlResponse.rows[i].searchquery)
      if (sqlResponse.rows[i].searchquery.toLowerCase() === query) {
        res.send(sqlResponse.rows[i]);
      }
    }
  }
  )
  superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GEOCODE_API_KEY}`).then(response => {
    const location = response.body.results[0].geometry.location;
    const formAddr = response.body.results[0].formatted_address;
    const searchquery = response.body.results[0].address_components[0].long_name.toLowerCase();
    if (query !== searchquery) {
      response.send(error);
      return null;
    }
    locationSubmitted = new Geolocation(searchquery, formAddr, location);
    res.send(locationSubmitted);
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
  superagent.get(`https://api.darksky.net/forecast/${WEATHER_API_KEY}/${locationSubmitted.latitude},${locationSubmitted.longitude}`).then(res => {
    const weatherArr = res.body.daily.data
    const reply = weatherArr.map(byDay => {
      return new Forecast(byDay.summary, byDay.time);
    })
    response.send(reply);
  })
})
// FORECAST CONSTRUCTOR FUNCTION
function Forecast(summary, time) {
  this.forecast = summary;
  this.time = (new Date(time * 1000)).toDateString();
}
app.get('/events', (request, response) => {
  superagent.get(`http://api.eventful.com/json/events/search?where=${locationSubmitted.latitude},${locationSubmitted.longitude}&within=25&app_key=${EVENTBRITE_API_KEY}`).then(res => {
    let events = JSON.parse(res.text);
    let moreEvents = events.events.event
    let eventData = moreEvents.map(event => {
      return new Event(event.url, event.title, event.start_time, event.description)
    })
    response.send(eventData);
  }).catch( function () {
    console.log('banana');
    return null;
  })
})
// EVENT CONSTRUCTOR FUNCTION
function Event(link, name, event_date, summary='none') {
  this.link = link,
  this.name = name,
  this.event_date = event_date,
  this.summary = summary
}

// GET FROM DB





app.listen(PORT, () => {
  console.log(`App is on PORT: ${PORT}`);
});
